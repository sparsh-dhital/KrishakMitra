import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Activity, FileText, Bell, DatabaseZap, ShieldAlert, CheckCircle2, Gavel } from "lucide-react";
import { api } from "../services/api";
import { SidebarLayout, Card, Badge, Button, Select } from "../components/ui";
import BuyerMarketplace from "./BuyerMarketplace";

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
    { id: "bookings", label: t("todayBookings"), icon: Users },
    { id: "queue", label: t("activeQueue"), icon: Activity },
    { id: "procurement", label: t("procurementJourney"), icon: FileText },
    { id: "payments", label: t("paymentStatus"), icon: DatabaseZap },
    { id: "alerts", label: t("alerts"), icon: ShieldAlert },
    { id: "reports", label: t("reports"), icon: Bell },
    { id: "marketplace", label: "Private Marketplace", icon: Gavel },
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
      {activeTab === "marketplace" ? <BuyerMarketplace role="admin" buyerId="demo-admin" /> : <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
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
      </div>}
    </SidebarLayout>
  );
}