import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Activity, FileText, Bell, DatabaseZap, ShieldAlert, CheckCircle2, Gavel, Clock } from "lucide-react";
import { api } from "../services/api";
import { SidebarLayout, Card, Badge, Button, Select, Input } from "../components/ui";
import { Plus, Trash2, Edit2 } from "lucide-react";
import BuyerMarketplace from "./BuyerMarketplace";

export default function AdminPage({ language, onLanguageChange, onLogout, onHome }) {
  const { t } = useTranslation();
  const [centre, setCentre] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [allBookings, setAllBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
    api.getAllBookings().then(setAllBookings);
  }, []);

  useEffect(() => {
    if (!selectedBooking?.booking?.id) return;
    setStatus(selectedBooking.booking.status || "BOOKED");

    api.getProcurement(selectedBooking.booking.id).then((data) => {
      const record = Array.isArray(data) ? data[0] : data;
      setProcurement(record || null);
      if (record?.id) {
        api.getPayment(record.id).then((payData) => setPayment(Array.isArray(payData) ? payData[0] : payData)).catch(() => {});
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

  const inQueueBookings = allBookings.filter(b => b.booking.status !== "PAID" && b.booking.status !== "COMPLETED");
  const processingBookings = allBookings.filter(b => b.booking.status === "QUALITY_CHECK" || b.booking.status === "WEIGHING" || b.booking.status === "ACCEPTED");


  const navItems = [
    { id: "dashboard", label: t("overview"), icon: LayoutDashboard },
    { id: "centres", label: "Centres", icon: DatabaseZap },
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
      onLogout={onLogout} onHome={onHome}
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
      </div>}

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
