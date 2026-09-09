import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Activity, FileText, Bell, DatabaseZap, ShieldAlert, CheckCircle2, Gavel, Clock } from "lucide-react";
import { api } from "../services/api";
import { SidebarLayout, Card, Badge, Button, Select, Input } from "../components/ui";
import { Plus, Trash2, Edit2 } from "lucide-react";
import BuyerMarketplace from "./BuyerMarketplace";

function CentresTab() {
  const [centres, setCentres] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: "", district: "", daily_capacity: "",
    supported_crops: [],
    operating_date: new Date().toISOString().split('T')[0],
    shift_start: "09:00",
    shift_end: "17:00",
    slot_duration: "30"
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getCentres(), api.getCrops()]).then(([cData, crData]) => {
      setCentres(cData || []);
      setCrops(crData || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCropToggle = (cropId) => {
    setFormData(prev => {
      const isSelected = prev.supported_crops.includes(cropId);
      return {
        ...prev,
        supported_crops: isSelected 
          ? prev.supported_crops.filter(id => id !== cropId) 
          : [...prev.supported_crops, cropId]
      };
    });
  };

  const generateSlots = () => {
    const slots = [];
    const { operating_date, shift_start, shift_end, slot_duration, daily_capacity } = formData;
    if (!operating_date || !shift_start || !shift_end || !slot_duration) return slots;
    
    let current = new Date(`${operating_date}T${shift_start}:00`);
    const end = new Date(`${operating_date}T${shift_end}:00`);
    const durationMs = Number(slot_duration) * 60000;
    
    // Calculate total slots to distribute capacity evenly
    let totalSlots = Math.floor((end - current) / durationMs);
    if (totalSlots <= 0) return slots;
    const capacityPerSlot = Math.floor(Number(daily_capacity) / totalSlots);

    while (current < end) {
      const startTimeStr = current.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
      current = new Date(current.getTime() + durationMs);
      if (current > end) break;
      const endTimeStr = current.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });

      slots.push({
        date: operating_date,
        start_time: startTimeStr,
        end_time: endTimeStr,
        capacity_quintals: capacityPerSlot,
        booked_quintals: 0
      });
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.supported_crops.length === 0) {
      toast.error("Please select at least one supported crop.");
      return;
    }

    try {
      const generatedSlots = generateSlots();
      const payload = { 
        name: formData.name,
        district: formData.district,
        daily_capacity: Number(formData.daily_capacity),
        supported_crops: formData.supported_crops,
        slots: generatedSlots
      };

      if (editingId) {
        await api.updateCentre(editingId, payload);
        toast.success("Centre updated successfully");
      } else {
        await api.createCentre(payload);
        toast.success("New procurement centre published with " + generatedSlots.length + " slots");
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ 
        name: "", district: "", daily_capacity: "", 
        supported_crops: [], operating_date: new Date().toISOString().split('T')[0], 
        shift_start: "09:00", shift_end: "17:00", slot_duration: "30" 
      });
      loadData();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this centre?")) return;
    try {
      await api.deleteCentre(id);
      toast.success("Centre deleted");
      loadData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (centre) => {
    setEditingId(centre.id);
    setFormData({ 
      name: centre.name, district: centre.district, daily_capacity: centre.daily_capacity,
      supported_crops: centre.supported_crops || [],
      operating_date: new Date().toISOString().split('T')[0],
      shift_start: "09:00", shift_end: "17:00", slot_duration: "30"
    });
    setIsAdding(true);
  };

  if (loading) return <div className="p-8 text-center text-forest font-bold font-display">Loading centres...</div>;

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-forest">Procurement Centres</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2 shadow-lg shadow-brand/20">
            <Plus className="w-4 h-4" /> Add Centre
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-slate-50 border-brand/20 shadow-xl shadow-brand/5 relative z-10">
          <h3 className="font-display font-extrabold text-xl mb-4 text-forest">{editingId ? "Edit Centre" : "Publish New Centre"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-bold text-sm text-forest border-b border-line pb-2">Basic Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Centre Name</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Mangalagiri Market Yard" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">District</label>
                  <Input required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="e.g. Guntur" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Daily Capacity (Quintals)</label>
                  <Input required type="number" min="100" value={formData.daily_capacity} onChange={e => setFormData({...formData, daily_capacity: e.target.value})} placeholder="e.g. 5000" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-forest border-b border-line pb-2">Supported Crops</h4>
              <div className="space-y-2">
                {crops.map(c => (
                  <label key={c.id} className="flex items-center gap-3 p-3 bg-white border border-line rounded-xl cursor-pointer hover:border-brand/30 transition-all">
                    <input type="checkbox" className="w-4 h-4 text-brand accent-brand" checked={formData.supported_crops.includes(c.id)} onChange={() => handleCropToggle(c.id)} />
                    <span className="text-sm font-bold text-forest">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-forest border-b border-line pb-2">Slot Generation</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Operating Date</label>
                  <Input required type="date" value={formData.operating_date} onChange={e => setFormData({...formData, operating_date: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Start Time</label>
                    <Input required type="time" value={formData.shift_start} onChange={e => setFormData({...formData, shift_start: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">End Time</label>
                    <Input required type="time" value={formData.shift_end} onChange={e => setFormData({...formData, shift_end: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Slot Duration</label>
                  <Select value={formData.slot_duration} onChange={e => setFormData({...formData, slot_duration: e.target.value})}>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-line pt-5">
              <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); setFormData({name: "", district: "", daily_capacity: "", supported_crops: [], operating_date: new Date().toISOString().split('T')[0], shift_start: "09:00", shift_end: "17:00", slot_duration: "30"}); }}>Cancel</Button>
              <Button type="submit">{editingId ? "Save Changes & Generate Slots" : "Publish Centre & Generate Slots"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-muted font-bold border-b border-line uppercase tracking-widest text-[10px]">
              <tr>
                 <th className="px-6 py-4">Centre Name</th>
                 <th className="px-6 py-4">District</th>
                 <th className="px-6 py-4">Capacity/Day</th>
                 <th className="px-6 py-4">Crops</th>
                 <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {centres.map(c => (
                 <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-forest">{c.name}</td>
                    <td className="px-6 py-4 text-muted font-medium">{c.district}</td>
                    <td className="px-6 py-4 font-mono font-semibold">{c.daily_capacity} q</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.supported_crops || []).map(crId => {
                          const cr = crops.find(crop => crop.id === crId);
                          return cr ? <Badge key={crId} tone="brand" className="text-[10px]">{cr.name.split(' ')[0]}</Badge> : null;
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => startEdit(c)} className="p-2 text-slate-400 hover:text-brand transition-colors rounded-full hover:bg-brand/10"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </td>
                 </tr>
              ))}
              {centres.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted font-medium">No procurement centres found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    );
  }

function TodaysBookingsTab() {
  const { t } = useTranslation();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const mockBookings = [
    { id: "KM-8492", farmer: "Ramesh Kumar", crop: "Paddy Grade A", qty: "40 Quintals", slot: "09:00 AM - 12:00 PM", status: "Pending" },
    { id: "KM-8493", farmer: "Suresh Babu", crop: "Cotton", qty: "15 Quintals", slot: "09:00 AM - 12:00 PM", status: "Arrived" },
    { id: "KM-8494", farmer: "Venkat Rao", crop: "Maize", qty: "25 Quintals", slot: "12:00 PM - 03:00 PM", status: "Pending" },
  ];

  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const getExportFileName = (extension) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `todays-bookings-${yyyy}-${mm}-${dd}.${extension}`;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildTableCsv = (rows) => {
    const header = ["Token ID", "Farmer", "Crop & Quantity", "Time Slot", "Status"];
    const dataRows = rows.map((row) => [row.id, row.farmer, `${row.crop} (${row.qty})`, row.slot, row.status]);
    const csvRows = [header, ...dataRows].map((line) => line.map((cell) => escapeCsv(cell)).join(","));
    return `\uFEFF${csvRows.join("\n")}`;
  };

  const buildPdfDocument = (rows) => {
    const table = [
      ["Token ID", "Farmer", "Crop & Quantity", "Time Slot", "Status"],
      ...rows.map((row) => [row.id, row.farmer, `${row.crop} (${row.qty})`, row.slot, row.status]),
    ];

    const widths = [90, 120, 150, 120, 80];
    const colSpacing = 10;
    const rowHeight = 20;
    let y = 760;
    let contentStream = "BT /F1 11 Tf 50 760 Td (Today's Bookings Report) Tj ET\n";

    table.forEach((row, rowIndex) => {
      let x = 50;
      row.forEach((cell, cellIndex) => {
        const safeCell = String(cell).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        const cellWidth = widths[cellIndex] || 100;
        contentStream += `BT /F1 9 Tf ${x} ${y - rowIndex * rowHeight} Td (${safeCell}) Tj ET\n`;
        x += cellWidth + colSpacing;
      });
    });

    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((obj) => {
      offsets.push(pdf.length);
      pdf += `${offsets.length - 1} 0 obj\n${obj}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return pdf;
  };

  const handleExport = (format) => {
    const rows = mockBookings;

    if (format === "pdf") {
      downloadFile(buildPdfDocument(rows), getExportFileName("pdf"), "application/pdf");
      return;
    }

    if (format === "word") {
      const htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <body>
            <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-family:Arial; font-size:11pt;">
              <tr>
                <th>Token ID</th>
                <th>Farmer</th>
                <th>Crop & Quantity</th>
                <th>Time Slot</th>
                <th>Status</th>
              </tr>
              ${rows.map((row) => `
                <tr>
                  <td>${row.id}</td>
                  <td>${row.farmer}</td>
                  <td>${row.crop} (${row.qty})</td>
                  <td>${row.slot}</td>
                  <td>${row.status}</td>
                </tr>
              `).join("")}
            </table>
          </body>
        </html>
      `;
      downloadFile(htmlTable, getExportFileName("doc"), "application/msword");
      return;
    }

    downloadFile(buildTableCsv(rows), getExportFileName("csv"), "text/csv;charset=utf-8");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-forest">{t("todaysBookings") || "Today's Bookings"}</h2>
          <p className="text-muted mt-1">Manage scheduled arrivals for today.</p>
        </div>
        <div className="relative">
          <Button variant="primary" className="gap-2" onClick={() => setExportMenuOpen((open) => !open)}>
            <FileText className="w-4 h-4" /> Export Report
          </Button>
          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-line bg-white shadow-xl z-20 overflow-hidden">
              <button type="button" onClick={() => { handleExport("pdf"); setExportMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm font-medium text-forest hover:bg-slate-50">PDF</button>
              <button type="button" onClick={() => { handleExport("word"); setExportMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm font-medium text-forest hover:bg-slate-50">Word Document</button>
              <button type="button" onClick={() => { handleExport("excel"); setExportMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm font-medium text-forest hover:bg-slate-50">Excel</button>
            </div>
          )}
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Token ID</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Crop & Quantity</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-forest">{booking.id}</td>
                  <td className="p-4 font-medium">{booking.farmer}</td>
                  <td className="p-4">
                    <p className="font-bold text-forest">{booking.crop}</p>
                    <p className="text-xs text-muted">{booking.qty}</p>
                  </td>
                  <td className="p-4">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.slot}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={booking.status === "Arrived" ? "primary" : "warning"}>{booking.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ActiveQueueTab() {
  const { t } = useTranslation();

  const initialQueue = [
    { id: "KM-8490", farmer: "Hari Krishna", crop: "Paddy Grade A", qty: "35 Quintals", status: "Quality Check", remainingSeconds: 15 * 60 },
    { id: "KM-8493", farmer: "Suresh Babu", crop: "Cotton", qty: "15 Quintals", status: "Weighing", remainingSeconds: 8 * 60 + 16 },
    { id: "KM-8488", farmer: "Gopi Chand", crop: "Paddy Grade A", qty: "50 Quintals", status: "Payment Processing", remainingSeconds: 3 * 60 + 15 },
  ];

  const [queue, setQueue] = useState(initialQueue);

  const nextStatusMap = {
    "Quality Check": "Weighing",
    Weighing: "Payment Processing",
    "Payment Processing": "Completed",
    Completed: "Completed",
  };

  const formatWaitTime = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins} mins ${secs} secs`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setQueue((currentQueue) =>
        currentQueue.map((item) => {
          if (item.status === "Completed") return item;

          const nextRemaining = Math.max(0, (item.remainingSeconds || 0) - 1);

          if (nextRemaining > 0) {
            return { ...item, remainingSeconds: nextRemaining };
          }

          const nextStatus = nextStatusMap[item.status] || item.status;
          const nextStageSeconds = nextStatus === "Completed" ? 0 : nextStatus === "Weighing" ? 8 * 60 + 16 : 3 * 60 + 15;

          return {
            ...item,
            status: nextStatus,
            remainingSeconds: nextStageSeconds,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-forest">{t("liveQueue") || "Active Queue"}</h2>
          <p className="text-muted mt-1">Real-time status of farmers currently at the centre.</p>
        </div>
        <div className="flex gap-3">
           <Badge variant="primary" className="bg-green-100 text-green-700">{queue.filter((item) => item.status !== "Completed").length} Currently Active</Badge>
           <Badge variant="outline">Avg Wait: 18 mins</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {queue.map((item, index) => {
          const isCompleted = item.status === "Completed";
          return (
            <Card key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: item.status === 'Quality Check' ? '#F59E0B' : item.status === 'Weighing' ? '#3B82F6' : item.status === 'Payment Processing' ? '#10B981' : '#94A3B8' }}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-400">
                   {index + 1}
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-bold text-forest text-lg">{item.farmer}</h3>
                     <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.id}</span>
                   </div>
                   <p className="text-sm text-muted">{item.crop} • {item.qty}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto">
                 <div className="text-left sm:text-right flex-1 sm:flex-none">
                   <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Current Status</p>
                   <Badge variant={item.status === 'Quality Check' ? 'warning' : item.status === 'Weighing' ? 'primary' : isCompleted ? 'default' : 'success'} className="text-sm">
                     {item.status}
                   </Badge>
                 </div>
                 <div className="text-right hidden sm:block min-w-[120px]">
                   <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Wait Time</p>
                   <p className="font-bold text-forest flex items-center justify-end gap-1"><Clock className="w-3 h-3 text-brand" /> {formatWaitTime(item.remainingSeconds)}</p>
                 </div>
                 <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                   Auto
                 </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
  
  export default function AdminPage({ language, onLanguageChange, onLogout, onHome }) {
  const { t } = useTranslation();
  const [centre, setCentre] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAllQueue, setShowAllQueue] = useState(false);

  const queueMembers = [
    { id: "KM-8490", name: "Hari Krishna", token: "KM-8490", quantity: "35 Quintals", status: "Weighing" },
    { id: "KM-8493", name: "Suresh Babu", token: "KM-8493", quantity: "15 Quintals", status: "Quality Check" },
    { id: "KM-8488", name: "Gopi Chand", token: "KM-8488", quantity: "50 Quintals", status: "Payment Processing" },
    { id: "KM-8496", name: "Ravi Teja", token: "KM-8496", quantity: "25 Quintals", status: "Waiting" },
  ];
  const queuePreview = showAllQueue ? queueMembers : queueMembers.slice(0, 2);
  const processingCount = queueMembers.filter((farmer) => farmer.status !== "Completed").length;

  const [booking, setBooking] = useState(() => {
    try {
      const saved = localStorage.getItem("krishak-mitra-booking");
      return !saved || saved === "undefined" ? null : JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState("BOOKED");
  const [procurement, setProcurement] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const statusTranslationKeys = {
    BOOKED: "statusBooked",
    CHECKED_IN: "statusCheckedIn",
    WAITING: "statusWaiting",
    WEIGHING: "statusWeighing",
    QUALITY_CHECK: "statusQualityCheck",
    ACCEPTED: "statusAccepted",
    PAID: "statusPaid",
  };

  useEffect(() => {
    api.getCentres().then((data) => setCentre(data?.[0] || null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!booking?.booking?.id) return;
    api.getBooking(booking.booking.id).then((data) => {
      setBooking((current) => ({ ...current, booking: data }));
      setStatus(data.status || "BOOKED");
    }).catch(() => {});

    api.getProcurement(booking.booking.id).then((data) => {
      const record = Array.isArray(data) ? data[0] : data;
      setProcurement(record || null);
      if (record?.id) {
        api.getPayment(record.id).then((payData) => setPayment(Array.isArray(payData) ? payData[0] : payData)).catch(() => {});
      }
    }).catch(() => {});
  }, [booking?.booking?.id]);

  async function saveStatus() {
    if (!booking?.booking?.id) return;
    try {
      const updated = await api.updateBookingStatus(booking.booking.id, status);
      setBooking((current) => ({ ...current, booking: updated }));
      toast.success(`${t("statusUpdated")}: ${t(statusTranslationKeys[status])}`);
    } catch (requestError) {
      toast.error(requestError.message || t("statusUpdateFailed"));
    }
  }

  const navItems = [
    { id: "dashboard", label: t("overview"), icon: LayoutDashboard },
    { id: "centres", label: "Centres", icon: DatabaseZap },
    { id: "bookings", label: t("todayBookings"), icon: Users },
    { id: "queue", label: t("activeQueue"), icon: Activity },
    { id: "procurement", label: t("procurementJourney"), icon: FileText },
    { id: "payments", label: t("paymentStatus"), icon: DatabaseZap },
    { id: "alerts", label: t("alerts"), icon: ShieldAlert },
    { id: "reports", label: t("reports"), icon: Bell },
    { id: "marketplace", label: t("marketplace") || "Private Marketplace", icon: Gavel },
  ];

  return (
    <SidebarLayout 
      navItems={navItems} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={onLogout} onHome={onHome}
      language={language}
      onLanguageChange={onLanguageChange}
    >
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-display text-2xl font-bold text-forest mb-6">{t("adminPortal")}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                   <Users className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">78</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("totalBookings")}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-50 text-brand flex items-center justify-center">
                   <Activity className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">{queueMembers.length}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("inQueue")}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                   <FileText className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">{processingCount}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("processing")}</p>
                 </div>
              </Card>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-line flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-forest text-lg">{t("liveQueue")}</h2>
                  <Badge tone="success" className="bg-emerald-100 text-emerald-700">{queueMembers.length} in queue</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllQueue((current) => !current)}
                  className="text-xs font-bold uppercase tracking-wider text-brand hover:text-brand/80 transition-colors"
                >
                  {showAllQueue ? "Show Less" : "View All"}
                </button>
              </div>
              <div className={`${showAllQueue ? "max-h-[420px] overflow-y-auto" : "h-[156px] overflow-hidden"} overflow-x-auto`}>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-muted font-bold border-b border-line">
                    <tr>
                       <th className="px-6 py-3">#</th>
                       <th className="px-6 py-3">{t("farmerName")}</th>
                       <th className="px-6 py-3">{t("token")}</th>
                       <th className="px-6 py-3">{t("quantityShort")}</th>
                       <th className="px-6 py-3">{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {queuePreview.length > 0 ? (
                      queuePreview.map((farmer, index) => (
                        <tr key={farmer.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-forest">{String(index + 1).padStart(2, "0")}</td>
                          <td className="px-6 py-4 font-bold text-forest">{farmer.name}</td>
                          <td className="px-6 py-4 font-mono text-muted">{farmer.token}</td>
                          <td className="px-6 py-4 text-forest font-medium">{farmer.quantity}</td>
                          <td className="px-6 py-4">
                            <Badge tone={farmer.status === "Payment Processing" ? "success" : farmer.status === "Quality Check" ? "warning" : "default"}>
                              {farmer.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-muted font-medium">{t("noFarmersInQueue")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Workflow Control for Demo */}
            {booking && (
              <Card>
                <h3 className="font-bold text-forest mb-4">{t("manageActiveToken")}: {booking?.token?.token_number || t("notAvailable")}</h3>
                <div className="flex items-end gap-4">
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">{t("stage")}</label>
                     <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="BOOKED">{t("statusBooked")}</option>
                        <option value="CHECKED_IN">{t("statusCheckedIn")}</option>
                        <option value="WAITING">{t("statusWaiting")}</option>
                        <option value="WEIGHING">{t("statusWeighing")}</option>
                        <option value="QUALITY_CHECK">{t("statusQualityCheck")}</option>
                        <option value="ACCEPTED">{t("statusAccepted")}</option>
                        <option value="PAID">{t("statusPaid")}</option>
                     </Select>
                   </div>
                   <Button onClick={saveStatus}>{t("updateToken")}</Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Centre Status */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
               <h3 className="font-display font-bold text-lg text-forest mb-4">{t("centreStatus")}</h3>
               <Badge tone="success" className="w-full justify-center py-2 text-sm mb-6"><span className="w-2 h-2 bg-green-500 rounded-full mr-2" /> {t("operatingNormally")}</Badge>
               
               <div className="space-y-4 mb-6">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-muted">{t("queue")}</span>
                   <span className="text-sm font-bold text-forest">23 {t("farmers")}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-muted">{t("estimatedWait")}</span>
                   <span className="text-sm font-bold text-forest">35 {t("minutes")}</span>
                 </div>
               </div>

               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">{t("capacity")}</span>
                    <span className="text-xs font-bold text-forest">51%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-brand h-2 rounded-full" style={{ width: '51%' }}></div>
                  </div>
               </div>
            </Card>

            <Card>
               <h3 className="font-display font-bold text-lg text-forest mb-4">{t("currentOperations")}</h3>
               <div className="space-y-6">
                  <div>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-bold text-forest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> {t("qualityAndWeight")}</span>
                       <span className="text-xs text-muted font-bold">12 / 20</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }}></div></div>
                  </div>
                  <div>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-bold text-forest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> {t("procurement")}</span>
                       <span className="text-xs text-muted font-bold">0 / 30</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '0%' }}></div></div>
                  </div>
                  <div>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-bold text-forest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand" /> {t("payment")}</span>
                       <span className="text-xs text-muted font-bold">54 / 78</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-brand h-1.5 rounded-full" style={{ width: '70%' }}></div></div>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "centres" && <CentresTab />}
      {activeTab === "bookings" && <TodaysBookingsTab />}
      {activeTab === "queue" && <ActiveQueueTab />}
      {activeTab === "marketplace" && <BuyerMarketplace userType="admin" />}

      {activeTab !== "dashboard" && activeTab !== "centres" && activeTab !== "bookings" && activeTab !== "queue" && activeTab !== "marketplace" && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-forest mb-2">Coming Soon</h2>
          <p className="text-muted text-lg max-w-md">The {navItems.find(i => i.id === activeTab)?.label} module is currently under development.</p>
        </div>
      )}
    </SidebarLayout>
  );
}
