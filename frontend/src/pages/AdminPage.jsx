import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Clock,
  CheckCircle2,
  RefreshCcw,
  ArrowRight,
  Building2,
} from "lucide-react";
import { api } from "../services/api";
import { Header, Panel, Badge } from "../components/ui";

export default function AdminPage({ language, onLanguageChange, onLogout, t }) {
  const [centre, setCentre] = useState(null);

  const [booking, setBooking] = useState(() => {
    try {
      const saved = localStorage.getItem("krishak-mitra-booking");
      if (!saved || saved === "undefined") return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState("BOOKED");
  const [procurement, setProcurement] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getCentres()
      .then((data) => {
        setCentre(data?.[0] || null);
      })
      .catch((requestError) => {
        setError(requestError.message);
        toast.error("Failed to load centre data");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!booking?.booking?.id) return;

    api
      .getBooking(booking.booking.id)
      .then((data) => {
        setBooking((current) => ({ ...current, booking: data }));
        setStatus(data.status || "BOOKED");
      })
      .catch(() => {});

    api
      .getProcurement(booking.booking.id)
      .then((data) => {
        const record = Array.isArray(data) ? data[0] : data;
        setProcurement(record || null);
        if (record?.id) {
          api
            .getPayment(record.id)
            .then((payData) =>
              setPayment(Array.isArray(payData) ? payData[0] : payData),
            )
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [booking?.booking?.id]);

  async function saveStatus() {
    if (!booking?.booking?.id) return;
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateBookingStatus(booking.booking.id, status);
      setBooking((current) => ({ ...current, booking: updated }));
      toast.success(`Booking status updated to ${status}`);
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-body pb-16 sm:pb-20">
      <Header
        admin
        language={language}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        centreName={centre?.name}
        t={t}
      />

      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-8 overflow-hidden rounded-b-4xl bg-forest text-white">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2072&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 z-0 bg-linear-to-r from-forest via-forest/90 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge tone="live" className="mb-4 text-xs sm:text-sm font-bold">
              <Building2 className="w-4 h-4 mr-1.5 inline" />{" "}
              {centre?.name || "Operations Console"}
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t.adminGreeting}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl font-medium">
              {t.adminIntro}
            </p>
          </div>
          <div className="glass-panel-dark rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 flex items-center gap-4 self-start md:self-auto">
            <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center text-brand shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Active Shift
              </p>
              <p className="font-display text-base sm:text-lg font-bold text-white">
                Live Operations
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8 relative z-20">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 text-sm sm:text-base font-bold text-red-800 shadow-sm flex items-center gap-3"
          >
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {loading ? (
          <Panel className="mt-8 text-center py-16">
            <RefreshCcw className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
            <p className="text-base sm:text-lg font-bold text-slate-500">
              Loading centre data...
            </p>
          </Panel>
        ) : (
          <>
            <div className="my-6 sm:my-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              <StatCard
                icon={Users}
                label={t.todayBookings}
                value={booking ? "1" : "0"}
                detail={centre?.name || "All counters open"}
              />
              <StatCard
                icon={Clock}
                label={t.capacityUsed}
                value={
                  centre?.daily_capacity ? `${centre.daily_capacity} q` : "-"
                }
                detail="Daily storage limit"
              />
              <StatCard
                icon={CheckCircle2}
                label={t.processedToday}
                value={status}
                detail={booking ? `Token active` : "Awaiting tokens"}
              />
            </div>

            <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.25fr_.75fr]">
              <Panel className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs font-bold tracking-[2px] text-brand uppercase mb-1">
                      {t.liveOperations}
                    </p>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
                      {t.queueAtCentre}
                    </h2>
                  </div>
                  <Badge tone="live">
                    <span className="text-xs">Active Queue</span>
                  </Badge>
                </div>

                {booking ? (
                  <div className="rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-6 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Token Number
                        </span>
                        <strong className="font-display text-2xl sm:text-3xl text-forest">
                          {booking.token?.token_number || "Pending"}
                        </strong>
                      </div>
                      <Badge tone="live">
                        <span className="text-xs sm:text-sm px-2.5 py-1">
                          {status}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">
                          Booking ID
                        </span>
                        <span className="font-bold text-slate-700 font-mono text-xs sm:text-sm bg-white p-2.5 rounded-xl border border-slate-200 block truncate">
                          {booking.booking.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">
                          Estimated Quantity
                        </span>
                        <span className="font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 block">
                          {booking.booking.estimated_quantity} Quintals
                        </span>
                      </div>
                    </div>

                    {(procurement || payment) && (
                      <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs sm:text-sm">
                        {procurement && (
                          <div>
                            <span className="text-xs font-bold text-slate-400 block mb-1">
                              Procurement Status
                            </span>
                            <span className="font-bold text-brand">
                              {procurement.procurement_status}
                            </span>
                          </div>
                        )}
                        {payment && (
                          <div>
                            <span className="text-xs font-bold text-slate-400 block mb-1">
                              Payment Status
                            </span>
                            <span className="font-bold text-brand">
                              {payment.payment_status}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 py-16 text-center px-4">
                    <Users className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-base sm:text-lg font-bold text-slate-500">
                      No active bookings in queue.
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Create a test booking from the farmer view to simulate
                      live center operations.
                    </p>
                  </div>
                )}
              </Panel>

              <Panel className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[2px] text-brand uppercase mb-1">
                    {t.selectedBooking}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest mb-6">
                    Workflow Control
                  </h2>

                  {booking ? (
                    <div className="space-y-6">
                      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                        <span className="text-xs font-bold text-green-800 uppercase block mb-1">
                          Active Token
                        </span>
                        <span className="font-display text-xl sm:text-2xl font-bold text-green-900">
                          {booking.token?.token_number}
                        </span>
                      </div>

                      <label className="block">
                        <span className="text-sm sm:text-base font-bold text-forest mb-2 sm:mb-3 block">
                          {t.updateStatus}
                        </span>
                        <select
                          value={status}
                          onChange={(event) => setStatus(event.target.value)}
                          className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:p-4 text-sm sm:text-base font-bold text-forest shadow-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer"
                        >
                          <option value="BOOKED">BOOKED</option>
                          <option value="CHECKED_IN">CHECKED_IN</option>
                          <option value="WAITING">WAITING</option>
                          <option value="WEIGHING">WEIGHING</option>
                          <option value="QUALITY_CHECK">QUALITY_CHECK</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="PAID">PAID</option>
                        </select>
                      </label>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-sm sm:text-base font-medium text-slate-500">
                        Select or create a live booking in the farmer portal to
                        manage its workflow stages here.
                      </p>
                    </div>
                  )}
                </div>

                {booking && (
                  <button
                    disabled={saving}
                    onClick={saveStatus}
                    className="mt-8 w-full rounded-2xl bg-brand py-4 text-base font-bold text-white transition-all hover:bg-brand-hover shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    {saving ? "Saving Changes..." : t.saveUpdate}{" "}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </Panel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <Panel className="relative overflow-hidden group border border-slate-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
          <Icon size={20} />
        </div>
      </div>
      <h3 className="font-display text-3xl sm:text-4xl font-bold text-forest mb-1.5 sm:mb-2 truncate">
        {value}
      </h3>
      <p className="text-xs sm:text-sm font-bold text-brand">{detail}</p>
    </Panel>
  );
}