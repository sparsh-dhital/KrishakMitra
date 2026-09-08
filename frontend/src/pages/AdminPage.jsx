import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Activity, FileText, Bell, DatabaseZap, ShieldAlert, CheckCircle2, Gavel } from "lucide-react";
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

export default function AdminPage({ language, onLanguageChange, onLogout }) {
  const { t } = useTranslation();
  const [centre, setCentre] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

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
      onLogout={onLogout}
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
                   <p className="font-display text-2xl font-extrabold text-forest">{booking ? "23" : "0"}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("inQueue")}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                   <FileText className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="font-display text-2xl font-extrabold text-forest">{booking && procurement ? "4" : "0"}</p>
                   <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{t("processing")}</p>
                 </div>
              </Card>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                <h2 className="font-bold text-forest text-lg">{t("liveQueue")}</h2>
                <Badge tone="default">{t("viewAll")}</Badge>
              </div>
              <div className="overflow-x-auto">
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
                    {booking ? (
                       <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-forest">01</td>
                          <td className="px-6 py-4 font-bold text-forest">Ramesh Kumar</td>
                          <td className="px-6 py-4 font-mono text-muted">{booking?.token?.token_number || t("notAvailable")}</td>
                          <td className="px-6 py-4 text-forest font-medium">{booking?.booking?.estimated_quantity || 0} {t("kilograms")}</td>
                          <td className="px-6 py-4"><Badge tone="warning">{t("statusWeighing")}</Badge></td>
                       </tr>
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
      {activeTab === "marketplace" && <BuyerMarketplace userType="admin" />}

      {activeTab !== "dashboard" && activeTab !== "centres" && activeTab !== "marketplace" && (
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