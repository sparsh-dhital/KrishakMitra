import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Badge, Header, Panel } from "../components/ui";

export default function AdminPage({ language, onLanguageChange, onLogout, t }) {
  const [centre, setCentre] = useState(null);
  const [booking, setBooking] = useState(() =>
    JSON.parse(localStorage.getItem("krishak-mitra-booking") || "null"),
  );
  const [status, setStatus] = useState("BOOKED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api
      .getCentres()
      .then((data) => setCentre(data?.[0] || null))
      .catch((requestError) => setError(requestError.message))
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
  }, [booking?.booking?.id]);
  async function saveStatus() {
    if (!booking?.booking?.id) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await api.updateBookingStatus(booking.booking.id, status);
      setBooking((current) => ({ ...current, booking: updated }));
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        admin
        language={language}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        centreName={centre?.name}
        t={t}
      />
      <main className="mx-auto max-w-290 px-4 py-10 sm:px-7 lg:py-16">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[1.5px] text-coral">
              TUESDAY, 18 JUNE 2024
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold">
              {t.adminGreeting}
            </h1>
            <p className="mt-2 text-sm text-muted">{t.adminIntro}</p>
          </div>
        </div>
        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <Panel className="mt-8">
            <p className="text-sm text-muted">Loading centre data...</p>
          </Panel>
        ) : (
          <>
            <div className="my-8 grid gap-3 sm:grid-cols-3">
              <Stat
                label={t.todayBookings}
                value={booking ? "1" : "0"}
                detail={centre?.name || "-"}
              />
              <Stat
                label={t.capacityUsed}
                value={
                  centre?.daily_capacity ? `${centre.daily_capacity} q` : "-"
                }
                detail="Daily capacity"
              />
              <Stat
                label={t.processedToday}
                value={status}
                detail={
                  booking
                    ? `Booking ${booking.booking.id}`
                    : "No booking selected"
                }
              />
            </div>
            <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
              <Panel>
                <p className="text-[10px] font-bold tracking-[1.5px] text-coral">
                  {t.liveOperations}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold">
                  {t.queueAtCentre}
                </h2>
                {booking ? (
                  <div className="mt-5 rounded-md border border-line p-4 text-sm">
                    <strong>
                      {booking.token?.token_number || "Token pending"}
                    </strong>
                    <span className="mt-1 block text-muted">
                      Booking ID: {booking.booking.id}
                    </span>
                    <span className="mt-1 block text-muted">
                      Status: {status}
                    </span>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    No booking data is available. Create a booking from the
                    farmer view first.
                  </p>
                )}
              </Panel>
              <Panel>
                <p className="text-[10px] font-bold tracking-[1.5px] text-coral">
                  {t.selectedBooking}
                </p>
                {booking ? (
                  <>
                    <h2 className="mt-4 font-display text-xl font-bold">
                      {booking.token?.token_number || "Booking"}
                    </h2>
                    <label className="mt-6 block text-xs font-bold">
                      {t.updateStatus}
                      <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="mt-2 w-full rounded-md border border-line p-3 text-sm font-normal"
                      >
                        <option>BOOKED</option>
                        <option>CHECKED_IN</option>
                        <option>WAITING</option>
                        <option>WEIGHING</option>
                        <option>QUALITY_CHECK</option>
                        <option>ACCEPTED</option>
                        <option>PAID</option>
                      </select>
                    </label>
                    <button
                      disabled={saving}
                      onClick={saveStatus}
                      className="mt-5 w-full rounded-md bg-coral p-3 text-xs font-bold text-white disabled:opacity-60"
                    >
                      {saving ? "Saving..." : saved ? "Saved" : t.saveUpdate} →
                    </button>
                  </>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    Select a live booking to update its status.
                  </p>
                )}
              </Panel>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <span className="text-xs text-muted">{label}</span>
      <strong className="my-3 block font-display text-2xl">{value}</strong>
      <small className="text-xs text-emerald-700">{detail}</small>
    </div>
  );
}
