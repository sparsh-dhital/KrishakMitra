import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Activity, FileText, Bell, DatabaseZap, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { api, useLiveSync } from "../services/api";
import { SidebarLayout, Card, Badge, Button, Select, Input, Eyebrow } from "../components/ui";
import QRCode from "react-qr-code";
import { Plus, Trash2, Edit2 } from "lucide-react";

function CentresTab() {
  const [centres, setCentres] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCropName, setNewCropName] = useState("");
  
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

  const handleAddNewCrop = async () => {
    if (!newCropName.trim()) return;
    try {
      const newCrop = await api.addCrop(newCropName.trim(), 0);
      setCrops(prev => [...prev, newCrop]);
      setFormData(prev => ({
        ...prev,
        supported_crops: [...prev.supported_crops, newCrop.id]
      }));
      setNewCropName("");
      toast.success("New crop added!");
    } catch (err) {
      toast.error("Failed to add crop");
    }
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
        <div>
          <Eyebrow className="mb-2">MANAGEMENT</Eyebrow>
          <h2 className="text-4xl font-bold font-display text-forest">Procurement Centres</h2>
        </div>
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
              <div className="flex gap-2 mt-2">
                <Input 
                  placeholder="Type new crop name..." 
                  value={newCropName} 
                  onChange={e => setNewCropName(e.target.value)} 
                  className="h-10 text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewCrop();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddNewCrop} className="h-10 whitespace-nowrap">
                  Add Crop
                </Button>
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
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Slot Duration (Minutes)</label>
                  <Input required type="number" min="5" value={formData.slot_duration} onChange={e => setFormData({...formData, slot_duration: e.target.value})} placeholder="e.g. 30" />
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
          <table className="w-full min-w-max text-sm text-left">
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

function TodaysBookingsTab({ bookings, onRemove, onViewDetails }) {
  const { t } = useTranslation();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
    const rows = (bookings || []).map(b => ({
      id: b.token?.token_number || "N/A",
      farmer: b.booking.farmer_name,
      crop: (b.booking.crops || []).map(c => c.crop_name).join(', '),
      qty: b.booking.estimated_quantity + " q",
      slot: b.booking.slot_time,
      status: b.booking.status
    }));

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
          <Eyebrow className="mb-2">DAILY OPERATIONS</Eyebrow>
          <h2 className="text-4xl font-display font-extrabold text-forest">{t("todaysBookings") || "Today's Bookings"}</h2>
          <p className="text-muted mt-2">Manage scheduled arrivals for today.</p>
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
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Token ID</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Crop & Quantity</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {bookings && bookings.length > 0 ? bookings.map((b) => {
                const booking = b.booking;
                const token = b.token;
                return (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-forest">{token?.token_number || "N/A"}</td>
                    <td className="p-4 font-medium">{booking.farmer_name}</td>
                    <td className="p-4">
                      <p className="font-bold text-forest">{(booking.crops || []).map(c => c.crop_name).join(', ') || "Unknown"}</p>
                      <p className="text-xs text-muted">{booking.estimated_quantity} q</p>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.slot_time}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge tone={booking.status === "PAID" ? "success" : "warning"}>{booking.status}</Badge>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200" onClick={() => { onViewDetails(b); }}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100" onClick={() => onRemove(booking.id)}>
                        Remove Farmer
                      </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="p-8 text-center text-muted font-medium">No bookings today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ActiveQueueTab({ bookings, onRemove, onViewDetails }) {
  const { t } = useTranslation();
  const [showAllQueue, setShowAllQueue] = useState(false);
  const queuePreview = showAllQueue || bookings.length <= 4 ? bookings : bookings.slice(0, 4);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Eyebrow className="mb-2">LIVE STATUS</Eyebrow>
          <h2 className="text-4xl font-display font-extrabold text-forest">{t("liveQueue") || "Active Queue"}</h2>
          <p className="text-muted mt-2">Real-time status of farmers currently at the centre.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="primary" className="bg-green-100 text-green-700">{bookings.length} Currently Active</Badge>
           {bookings.length > 4 && (
             <button
               type="button"
               onClick={() => setShowAllQueue((current) => !current)}
               className="text-xs font-bold uppercase tracking-wider text-brand hover:text-brand/80 transition-colors"
             >
               {showAllQueue ? "Show Less" : "View All"}
             </button>
           )}
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${showAllQueue ? "max-h-[500px] overflow-y-auto pr-2" : ""}`}>
        {queuePreview && queuePreview.length > 0 ? queuePreview.map((b, index) => {
          const item = b.booking;
          return (
            <Card key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: item.status === 'QUALITY_CHECK' ? '#F59E0B' : item.status === 'WEIGHING' ? '#3B82F6' : '#10B981' }}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-400">
                   {index + 1}
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-bold text-forest text-lg">{item.farmer_name}</h3>
                     <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{b.token?.token_number}</span>
                   </div>
                   <p className="text-sm text-muted">{(item.crops || []).map(c => c.crop_name).join(', ')} • {item.estimated_quantity} q</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto">
                 <div className="text-left sm:text-right flex-1 sm:flex-none">
                   <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Current Status</p>
                   <Badge tone={item.status === 'QUALITY_CHECK' ? 'warning' : 'primary'} className="text-sm">
                     {item.status}
                   </Badge>
                 </div>
                 <Button variant="outline" size="sm" className="shrink-0" onClick={() => { onViewDetails(b); }}>
                   View Details
                 </Button>
                 <Button variant="outline" size="sm" className="shrink-0 bg-red-50 text-red-600 hover:bg-red-100 border-red-100" onClick={() => onRemove(item.id)}>
                   Remove Farmer
                 </Button>
              </div>
            </Card>
          );
        }) : (
          <p className="text-muted text-center py-10">No farmers currently in the queue.</p>
        )}
      </div>
    </div>
  );
}

function PaymentManagementTab({ bookings, onStatusChange }) {
  const pendingPayments = bookings.filter(b => b.booking.status === "PAYMENT_REQUESTED");
  const completedPayments = bookings.filter(b => b.booking.status === "PAID");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleMarkPaid = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;
    const fileInput = e.target.elements.receipt;
    const file = fileInput.files[0];
    if (!file) {
      toast.error("Please select a payment receipt file");
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        await api.processPayment(selectedPayment.booking.id, dataUrl);
        toast.success("Payment marked as PAID for booking " + selectedPayment.booking.id);
        setSelectedPayment(null);
        if (onStatusChange) onStatusChange();
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      toast.error("Failed to process payment");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-forest">Payment Management</h2>
          <p className="text-muted mt-1">Process pending farmer payments and view history.</p>
        </div>
      </div>
      
      <Card className="p-0 overflow-hidden mb-8">
        <div className="p-4 bg-slate-50 border-b border-line">
          <h3 className="font-bold text-forest">Pending Payment Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Farmer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Crop (Qty)</th>
                <th className="p-4">Fare (Rs)</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pendingPayments.map(p => (
                <tr key={p.booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-forest">{p.booking.farmer_name}</td>
                  <td className="p-4 text-muted">{p.booking.farmer_mobile || "+91 98765 43210"}</td>
                  <td className="p-4 text-muted">{(p.booking.crops || []).map(c => c.crop_name).join(', ')} ({p.booking.estimated_quantity}q)</td>
                  <td className="p-4 font-mono font-bold text-brand">₹ {p.booking.estimated_fare}</td>
                  <td className="p-4 pr-6 text-right">
                    <Button variant="primary" size="sm" onClick={() => setSelectedPayment(p)}>
                      Process Payment
                    </Button>
                  </td>
                </tr>
              ))}
              {pendingPayments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted">No pending payment requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-line">
          <h3 className="font-bold text-forest">Completed Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Farmer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Crop (Qty)</th>
                <th className="p-4">Fare (Rs)</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {completedPayments.map(p => (
                <tr key={p.booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-forest">{p.booking.farmer_name}</td>
                  <td className="p-4 text-muted">{p.booking.farmer_mobile || "-"}</td>
                  <td className="p-4 text-muted">{(p.booking.crops || []).map(c => c.crop_name).join(', ')} ({p.booking.estimated_quantity}q)</td>
                  <td className="p-4 font-mono font-bold text-brand">₹ {p.booking.estimated_fare}</td>
                  <td className="p-4 pr-6 text-right">
                    <Badge tone="success" className="gap-1.5 px-3 py-1.5"><Check className="w-3.5 h-3.5" /> Paid</Badge>
                  </td>
                </tr>
              ))}
              {completedPayments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted">No completed payments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-line bg-slate-50">
              <h3 className="font-display font-bold text-lg text-forest">Upload Payment Receipt</h3>
              <p className="text-sm text-muted">Upload proof of payment to mark as PAID.</p>
            </div>
            <form onSubmit={handleMarkPaid} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted mb-1">Farmer: <strong className="text-forest">{selectedPayment.booking.farmer_name}</strong></p>
                <p className="text-sm text-muted mb-1">Amount to pay: <strong className="text-brand font-mono">₹ {selectedPayment.booking.estimated_fare}</strong></p>
                <p className="text-sm text-muted mb-4">Bank Details: <strong className="text-forest">{selectedPayment.booking.farmer_bank || "Not Provided"}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-bold text-forest mb-2">Select Receipt (Image/PDF)</label>
                <input type="file" name="receipt" accept="image/*,.pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20" required />
              </div>
              <div className="flex gap-3 pt-4 border-t border-line mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedPayment(null)} disabled={isProcessing}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={isProcessing}>{isProcessing ? "Processing..." : "Mark as PAID"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcurementJourneyTab({ bookings, onStatusChange, onViewDetails }) {
  const { t } = useTranslation();
  const processingBookings = bookings.filter(b => b.booking.status === "QUALITY_CHECK" || b.booking.status === "WEIGHING" || b.booking.status === "ACCEPTED");

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="mb-6">
        <Eyebrow className="mb-2">WORKFLOW</Eyebrow>
        <h2 className="text-4xl font-display font-extrabold text-forest">{t("procurementJourney")}</h2>
        <p className="text-muted mt-2">Manage farmers currently undergoing quality check, weighing, or accepted stages.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {processingBookings && processingBookings.length > 0 ? processingBookings.map((b) => {
          const item = b.booking;
          return (
            <Card key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: '#3B82F6' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-forest text-lg">{item.farmer_name}</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{b.token?.token_number}</span>
                </div>
                <p className="text-sm text-muted">{(item.crops || []).map(c => c.crop_name).join(', ')} • {item.estimated_quantity} q</p>
              </div>
              <div className="flex items-center gap-4">
                 <Badge tone="primary" className="text-sm">{item.status}</Badge>
                 <Button variant="outline" size="sm" onClick={() => onViewDetails(b)}>View Details</Button>
              </div>
            </Card>
          );
        }) : (
          <p className="text-muted text-center py-10">No procurement in progress.</p>
        )}
      </div>
    </div>
  );
}

function AlertsTab({ notifications, onMarkRead }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Eyebrow className="mb-2">NOTIFICATIONS</Eyebrow>
          <h2 className="text-4xl font-display font-extrabold text-forest">{t("alerts")}</h2>
        </div>
        <Button onClick={onMarkRead} variant="outline" size="sm">Mark All Read</Button>
      </div>
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map(n => (
          <Card key={n.id} className={`p-4 border-l-4 ${n.read ? 'border-slate-200 opacity-70' : 'border-amber-500 shadow-md'}`}>
            <p className="text-forest font-medium">{n.message}</p>
            <p className="text-xs text-muted mt-2">{new Date(n.date).toLocaleString()}</p>
          </Card>
        )) : (
          <p className="text-muted text-center py-10">No alerts found.</p>
        )}
      </div>
    </div>
  );
}

function ReportsTab({ bookings }) {
  const { t } = useTranslation();
  const total = bookings.length;
  const paid = bookings.filter(b => b.booking.status === "PAID").length;
  const inQueue = bookings.filter(b => ["BOOKED", "CHECKED_IN", "WAITING", "QUALITY_CHECK", "WEIGHING", "ACCEPTED"].includes(b.booking.status)).length;
  
  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="mb-6">
        <Eyebrow className="mb-2">ANALYTICS</Eyebrow>
        <h2 className="text-4xl font-display font-extrabold text-forest">{t("reports")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="text-center p-6 bg-brand/5 border-brand/20 shadow-none">
           <p className="text-4xl font-display font-bold text-brand">{total}</p>
           <p className="text-xs font-bold uppercase tracking-widest text-muted mt-2">Total Bookings</p>
        </Card>
        <Card className="text-center p-6 bg-blue-50 border-blue-100 shadow-none">
           <p className="text-4xl font-display font-bold text-blue-600">{inQueue}</p>
           <p className="text-xs font-bold uppercase tracking-widest text-muted mt-2">In Progress</p>
        </Card>
        <Card className="text-center p-6 bg-green-50 border-green-100 shadow-none">
           <p className="text-4xl font-display font-bold text-green-600">{paid}</p>
           <p className="text-xs font-bold uppercase tracking-widest text-muted mt-2">Completed & Paid</p>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage({ language, onLanguageChange, onLogout, onHome }) {
  const { t } = useTranslation();
  const [centre, setCentre] = useState(null);
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("krishak-mitra-admin-tab") || "dashboard");

  useEffect(() => {
    sessionStorage.setItem("krishak-mitra-admin-tab", activeTab);
  }, [activeTab]);

  const [allBookings, setAllBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalBooking, setDetailModalBooking] = useState(null);

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

  const [notifications, setNotifications] = useState([]);
  
  const syncTick = useLiveSync();
  useEffect(() => {
    api.getCentres().then((data) => setCentre(data?.[0] || null)).finally(() => setLoading(false));
    api.getAllBookings().then(setAllBookings);
    api.getNotifications().then(setNotifications);
  }, [syncTick]);

  const handleMarkRead = async () => {
    await api.markNotificationsRead();
    api.getNotifications().then(setNotifications);
  };

  useEffect(() => {
    if (!selectedBooking?.booking?.id) return;
    setStatus(selectedBooking.booking.status || "BOOKED");

    api.getProcurement(selectedBooking.booking.id).then((data) => {
      const record = Array.isArray(data) ? data[0] : data;
      setProcurement(record || null);
      if (record?.id) {
        api.getPayment(record.id, selectedBooking.booking.id).then((payData) => setPayment(Array.isArray(payData) ? payData[0] : payData)).catch(() => {});
      }
    }).catch(() => {});
  }, [selectedBooking?.booking?.id]);

  async function saveStatus() {
    if (!selectedBooking?.booking?.id) return;
    try {
      const updated = await api.updateBookingStatus(selectedBooking.booking.id, status);
      const newBookings = allBookings.map(b => b.booking.id === selectedBooking.booking.id ? { ...b, booking: updated } : b);
      setAllBookings(newBookings);
      setSelectedBooking(newBookings.find(b => b.booking.id === selectedBooking.booking.id));
      toast.success(`${t("statusUpdated")}: ${t(statusTranslationKeys[status]) || status}`);
    } catch (requestError) {
      toast.error(requestError.message || t("statusUpdateFailed"));
    }
  }

  async function handleDeleteBooking(bookingId) {
    if (!confirm("Are you sure you want to remove this farmer booking?")) return;
    try {
      await api.deleteBooking(bookingId);
      setAllBookings(prev => prev.filter(b => b.booking.id !== bookingId));
      if (selectedBooking?.booking?.id === bookingId) {
        setSelectedBooking(null);
      }
      toast.success("Farmer removed successfully.");
    } catch (err) {
      toast.error("Failed to remove farmer.");
    }
  }

  const inQueueBookings = allBookings.filter(b => b.booking.status !== "PAID" && b.booking.status !== "COMPLETED");
  const processingBookings = allBookings.filter(b => b.booking.status === "QUALITY_CHECK" || b.booking.status === "WEIGHING" || b.booking.status === "ACCEPTED");


  const navItems = [
    { id: "dashboard", label: t("overview"), icon: LayoutDashboard },
    { id: "centres", label: "Centres", icon: DatabaseZap },
    { id: "crops", label: t("cropsMsp") || "Crops & MSP", icon: FileText },
    { id: "bookings", label: t("todayBookings"), icon: Users },
    { id: "queue", label: t("activeQueue"), icon: Activity },
    { id: "procurement", label: t("procurementJourney"), icon: FileText },
    { id: "payments", label: t("paymentStatus"), icon: DatabaseZap },
    { id: "alerts", label: t("alerts"), icon: ShieldAlert },
    { id: "reports", label: t("reports"), icon: Bell },
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
            <div className="mb-6">
               <Eyebrow className="mb-2">OVERVIEW</Eyebrow>
               <h1 className="font-display text-4xl font-bold text-forest">{t("adminPortal")}</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                   <Users className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">{allBookings.length}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("totalBookings")}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-50 text-brand flex items-center justify-center">
                   <Activity className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">{inQueueBookings.length}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("inQueue")}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                   <FileText className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">{processingBookings.length}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("processing")}</p>
                 </div>
              </Card>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                <Eyebrow>{t("liveQueue")}</Eyebrow>
                <Badge tone="default">{t("viewAll")}</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left">
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
                    {inQueueBookings.length > 0 ? (
                       inQueueBookings.map((b, i) => (
                         <tr key={b.booking.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedBooking?.booking?.id === b.booking.id ? 'bg-brand/5' : ''}`} onClick={() => setSelectedBooking(b)}>
                            <td className="px-6 py-4 font-bold text-forest">{(i+1).toString().padStart(2, '0')}</td>
                            <td className="px-6 py-4 font-bold text-forest">{b.booking.farmer_name || "Unknown"}</td>
                            <td className="px-6 py-4 font-mono text-muted">{b.token?.token_number || t("notAvailable")}</td>
                            <td className="px-6 py-4 text-forest font-medium">{b.booking.estimated_quantity || 0} q</td>
                            <td className="px-6 py-4"><Badge tone={b.booking.status === "PAID" ? "success" : "warning"}>{t(statusTranslationKeys[b.booking.status]) || b.booking.status}</Badge></td>
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
            {selectedBooking && (
              <Card>
                <h3 className="font-bold text-forest mb-4">{t("manageActiveToken")}: {selectedBooking?.token?.token_number || t("notAvailable")} ({selectedBooking.booking.farmer_name})</h3>
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
      {activeTab === "crops" && <CropsTab />}
      {activeTab === "bookings" && <TodaysBookingsTab bookings={allBookings} onRemove={handleDeleteBooking} onViewDetails={setDetailModalBooking} />}
      {activeTab === "queue" && <ActiveQueueTab bookings={inQueueBookings} onRemove={handleDeleteBooking} onViewDetails={setDetailModalBooking} />}
      {activeTab === "payments" && <PaymentManagementTab bookings={allBookings} />}

      {activeTab === "procurement" && <ProcurementJourneyTab bookings={allBookings} onViewDetails={setDetailModalBooking} />}
      {activeTab === "alerts" && <AlertsTab notifications={notifications} onMarkRead={handleMarkRead} />}
      {activeTab === "reports" && <ReportsTab bookings={allBookings} />}

      {activeTab !== "dashboard" && activeTab !== "crops" && activeTab !== "centres" && activeTab !== "bookings" && activeTab !== "queue" && activeTab !== "payments" && activeTab !== "procurement" && activeTab !== "alerts" && activeTab !== "reports" && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-forest mb-2">Coming Soon</h2>
          <p className="text-muted text-lg max-w-md">The {navItems.find(i => i.id === activeTab)?.label} module is currently under development.</p>
        </div>
      )}
    

      {detailModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-line bg-slate-50">
              <div>
                <h3 className="text-xl font-bold font-display text-forest">Booking Details</h3>
                <p className="text-sm text-muted">Token ID: <span className="font-mono font-bold">{detailModalBooking.token?.token_number}</span></p>
              </div>
              <button onClick={() => setDetailModalBooking(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 bg-white rounded-full border border-line shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-2xl font-display">
                  {detailModalBooking.booking.farmer_name?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-forest">{detailModalBooking.booking.farmer_name}</h4>
                  <p className="text-sm text-muted flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Registered Farmer
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-line space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-widest text-muted border-b border-line pb-2">Crop Details & Fare</h5>
                {(detailModalBooking.booking.crops || []).map((c, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div>
                      <p className="font-bold text-forest text-sm">{c.crop_name}</p>
                      <p className="text-xs text-muted">Qty: {c.quantity} q</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-brand">₹ {c.total_fare?.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-muted">MSP: ₹ {c.minimum_support_price}/q</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600/70 mb-1">Total Estimated Fare</p>
                  <p className="text-xl font-mono font-extrabold text-amber-700">₹ {detailModalBooking.booking.estimated_fare?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600/70 mb-1">Current Status</p>
                  <div className="mt-1">
                    <Badge tone={detailModalBooking.booking.status === "PAID" ? "success" : "warning"}>{detailModalBooking.booking.status}</Badge>
                  </div>
                </div>
              </div>

              {/* QR Gate Pass for this booking */}
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-line">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Farmer's Gate Pass QR</p>
                <div className="p-4 bg-white rounded-xl border-2 border-brand/20 shadow-sm">
                  <QRCode
                    value={JSON.stringify({
                      ticketId: detailModalBooking.booking.id,
                      tokenNumber: detailModalBooking.token?.token_number,
                      farmerName: detailModalBooking.booking.farmer_name,
                      crops: (detailModalBooking.booking.crops || []).map(c => ({ name: c.crop_name, quantity: c.quantity })),
                      totalQuantity: detailModalBooking.booking.estimated_quantity || 0,
                      centerId: detailModalBooking.booking.centre_id,
                      status: detailModalBooking.booking.status || "BOOKED",
                      date: detailModalBooking.booking.date,
                      estimatedFare: detailModalBooking.booking.estimated_fare || 0,
                    })}
                    size={140}
                    level="H"
                  />
                </div>
                <p className="text-xs text-muted font-medium">Scan to verify farmer entry</p>
              </div>
            </div>

            <div className="p-4 border-t border-line bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDetailModalBooking(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </SidebarLayout>
  );
}

function CropsTab() {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", minimum_support_price: "" });

  const loadCrops = () => {
    setLoading(true);
    api.getCrops().then(setCrops).finally(() => setLoading(false));
  };

  useEffect(() => { loadCrops(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCrop(editingId, formData.name, Number(formData.minimum_support_price));
        toast.success("Crop updated successfully");
      } else {
        await api.addCrop(formData.name, Number(formData.minimum_support_price));
        toast.success("New crop added");
      }
      setEditingId(null);
      setFormData({ name: "", minimum_support_price: "" });
      loadCrops();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this crop?")) return;
    try {
      await api.deleteCrop(id);
      toast.success("Crop deleted");
      loadCrops();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-forest">Crops & MSP Management</h2>
        {editingId === null && (
          <Button onClick={() => setEditingId("")} className="gap-2">
            <Plus className="w-4 h-4" /> Add Crop
          </Button>
        )}
      </div>

      {editingId !== null && (
        <Card className="bg-slate-50 border-brand/20">
          <h3 className="font-display font-bold text-lg mb-4 text-forest">{editingId ? "Edit Crop" : "Add New Crop"}</h3>
          <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-muted uppercase">Crop Name</label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Paddy" />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-muted uppercase">MSP (₹ per Quintal)</label>
              <Input required type="number" value={formData.minimum_support_price} onChange={e => setFormData({...formData, minimum_support_price: e.target.value})} placeholder="e.g. 2200" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setFormData({name: "", minimum_support_price: ""}); }}>Cancel</Button>
              <Button type="submit">{editingId ? "Save" : "Add"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead className="bg-slate-50 text-muted font-bold border-b border-line uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 pl-6">Crop Name</th>
                <th className="p-4">Minimum Support Price (MSP)</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {crops.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-bold text-forest">{c.name}</td>
                  <td className="p-4 font-mono font-bold text-brand">₹ {c.minimum_support_price}</td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button onClick={() => { setEditingId(c.id); setFormData({ name: c.name, minimum_support_price: c.minimum_support_price }); }} className="p-2 text-slate-400 hover:text-brand rounded-full hover:bg-brand/10"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
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
