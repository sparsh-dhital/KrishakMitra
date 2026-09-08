import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Activity, FileText, Bell, DatabaseZap, ShieldAlert, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { SidebarLayout, Card, Badge, Button, Select } from "../components/ui";

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
      toast.success(`Updated to ${status}`);
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  const navItems = [
    { id: "dashboard", label: t("overview") || "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: t("todayBookings") || "Bookings", icon: Users },
    { id: "queue", label: t("activeQueue") || "Queue", icon: Activity },
    { id: "procurement", label: t("procurementJourney") || "Procurement", icon: FileText },
    { id: "payments", label: t("paymentStatus") || "Payments", icon: DatabaseZap },
    { id: "alerts", label: "Alerts", icon: ShieldAlert },
    { id: "reports", label: "Reports", icon: Bell },
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">{t("adminPortal") || "Operational Overview"}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Users className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-display text-2xl font-extrabold text-forest">78</p>
                 <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Total Bookings</p>
               </div>
            </Card>
            <Card className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-green-50 text-brand flex items-center justify-center">
                 <Activity className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-display text-2xl font-extrabold text-forest">{booking ? "23" : "0"}</p>
                 <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">In Queue</p>
               </div>
            </Card>
            <Card className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                 <FileText className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-display text-2xl font-extrabold text-forest">{booking && procurement ? "4" : "0"}</p>
                 <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Processing</p>
               </div>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <h2 className="font-bold text-forest text-lg">Live Queue</h2>
              <Badge tone="default">View All</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-muted font-bold border-b border-line">
                  <tr>
                     <th className="px-6 py-3">#</th>
                     <th className="px-6 py-3">Farmer Name</th>
                     <th className="px-6 py-3">Token</th>
                     <th className="px-6 py-3">Qty</th>
                     <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {booking ? (
                     <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-forest">01</td>
                        <td className="px-6 py-4 font-bold text-forest">Ramesh Kumar</td>
                        <td className="px-6 py-4 font-mono text-muted">{booking?.token?.token_number || "N/A"}</td>
                        <td className="px-6 py-4 text-forest font-medium">{booking?.booking?.estimated_quantity || 0} kg</td>
                        <td className="px-6 py-4"><Badge tone="warning">Processing</Badge></td>
                     </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted font-medium">No farmers in queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Workflow Control for Demo */}
          {booking && (
            <Card>
              <h3 className="font-bold text-forest mb-4">Manage Active Token: {booking?.token?.token_number || "N/A"}</h3>
              <div className="flex items-end gap-4">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Stage</label>
                   <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="BOOKED">BOOKED</option>
                      <option value="CHECKED_IN">CHECKED_IN</option>
                      <option value="WAITING">WAITING</option>
                      <option value="WEIGHING">WEIGHING</option>
                      <option value="QUALITY_CHECK">QUALITY_CHECK</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="PAID">PAID</option>
                   </Select>
                 </div>
                 <Button onClick={saveStatus}>Update Token</Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Centre Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
             <h3 className="font-display font-bold text-lg text-forest mb-4">Centre Status</h3>
             <Badge tone="success" className="w-full justify-center py-2 text-sm mb-6"><span className="w-2 h-2 bg-green-500 rounded-full mr-2" /> Operating Normally</Badge>
             
             <div className="space-y-4 mb-6">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-muted">Queue</span>
                 <span className="text-sm font-bold text-forest">23 farmers</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-muted">Est. Wait</span>
                 <span className="text-sm font-bold text-forest">35 min</span>
               </div>
             </div>

             <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Capacity</span>
                  <span className="text-xs font-bold text-forest">51%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-brand h-2 rounded-full" style={{ width: '51%' }}></div>
                </div>
             </div>
          </Card>

          <Card>
             <h3 className="font-display font-bold text-lg text-forest mb-4">Current Operations</h3>
             <div className="space-y-6">
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-bold text-forest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Quality & Weight</span>
                     <span className="text-xs text-muted font-bold">12 / 20</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }}></div></div>
                </div>
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-bold text-forest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Procurement</span>
                     <span className="text-xs text-muted font-bold">0 / 30</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '0%' }}></div></div>
                </div>
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-bold text-forest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand" /> Payment</span>
                     <span className="text-xs text-muted font-bold">54 / 78</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-brand h-1.5 rounded-full" style={{ width: '70%' }}></div></div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}