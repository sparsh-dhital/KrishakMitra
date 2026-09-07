// ==========================================
// 1. CONFIGURATION & API SERVICE
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const DEMO_CREDENTIALS = {
  mobile: "9876543210",
  otp: "123456",
  adminKey: "MANDI-ADMIN",
};

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      `Cannot connect to the backend at ${API_URL}${path}. Start FastAPI and check the API URL.`,
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      body?.detail || `Backend request failed (${response.status})`;
    throw new Error(detail);
  }
  return body;
}

export const api = {
  getCentres: () => request("/centres"),
  getCrops: () => request("/crops"),
  getFarmer: (farmerId) => request(`/farmers/${farmerId}`),
  getSlots: (centreId, date) =>
    request(
      `/slots${
        centreId || date
          ? `?${[
              centreId ? `centre_id=${encodeURIComponent(centreId)}` : "",
              date ? `date=${encodeURIComponent(date)}` : "",
            ]
              .filter(Boolean)
              .join("&")}`
          : ""
      }`,
    ),
  createBooking: (payload) =>
    request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getBooking: (bookingId) => request(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, status) =>
    request(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getQueueEntry: (tokenId) => request(`/queue/token/${tokenId}`),
  getProcurement: (bookingId) => request(`/procurement/${bookingId}`),
  getPayment: (procurementId) => request(`/payment/${procurementId}`),
  health: () => request("/health"),
  sendOtp: (mobile) => {
    if (mobile === DEMO_CREDENTIALS.mobile) {
      return Promise.resolve({ success: true, message: "Demo OTP sent" });
    }
    return request("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    });
  },
  verifyOtp: (payload) => {
    if (
      payload.mobile === DEMO_CREDENTIALS.mobile &&
      payload.otp === DEMO_CREDENTIALS.otp
    ) {
      if (
        payload.role === "admin" &&
        payload.adminKey !== DEMO_CREDENTIALS.adminKey
      ) {
        return Promise.reject(new Error("Invalid admin key. Use MANDI-ADMIN"));
      }
      return Promise.resolve({ success: true, farmer_id: "demo-farmer-id" });
    }
    return request("/auth/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const config = {
  apiUrl: API_URL,
  docsUrl: `${API_URL}/docs`,
  farmerId: import.meta.env.VITE_FARMER_ID || "",
  defaultCropId: import.meta.env.VITE_CROP_ID || "",
};

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function toUiSlot(slot) {
  const remaining =
    Number(slot.capacity_quintals || 0) - Number(slot.booked_quintals || 0);
  return {
    id: slot.id,
    date: new Date(`${slot.date}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: `${slot.start_time} - ${slot.end_time}`,
    remaining,
    tone: remaining < 25 ? "amber" : "green",
    raw: slot,
  };
}

// ==========================================
// 2. COMPONENTS (UI, Header, LanguagePicker)
// ==========================================

export function LanguagePicker({ language, onChange }) {
  return (
    <select
      value={language}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-md border border-line bg-white px-3 py-1.5 text-xs text-forest outline-none"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="te">తెలుగు</option>
      <option value="mr">मराठी</option>
      <option value="bn">বাংলা</option>
    </select>
  );
}

export function Header({
  admin,
  language,
  onLanguageChange,
  onLogout,
  centreName,
  t,
}) {
  return (
    <header className="border-b border-line bg-white px-4 py-4 sm:px-7">
      <div className="mx-auto flex max-w-290 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest text-sm text-white">
            KM
          </span>
          <div>
            <span className="text-base text-forest">Krishak Mitra</span>
            <span className="block text-[11px] text-muted">
              {centreName || (admin ? t.adminPortal : t.farmerPortal)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguagePicker language={language} onChange={onLanguageChange} />
          <button
            onClick={onLogout}
            className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:border-forest hover:text-forest"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-line bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

// ==========================================
// 3. PAGES (Login & Admin)
// ==========================================

import { useState, useEffect } from "react";

export function LoginPage({ language, onLanguageChange, onLogin }) {
  const [role, setRole] = useState("farmer");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillDemo() {
    setMobile(DEMO_CREDENTIALS.mobile);
    setOtp(DEMO_CREDENTIALS.otp);
    if (role === "admin") {
      setAdminKey(DEMO_CREDENTIALS.adminKey);
    }
    setSent(true);
    setError("");
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await api.sendOtp(mobile);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.verifyOtp({ mobile, otp, role, adminKey });
      onLogin(role, mobile, response.farmer_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 px-4 py-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-emerald-800/60" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full border border-emerald-800/60" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-forest p-10 text-white lg:block">
          <div className="absolute -right-24 top-16 h-72 w-72 rounded-full border border-emerald-200/20" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-2xl">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-coral text-xs">
                  KM
                </span>
                Krishak <span className="text-orange-200">Mitra</span>
              </div>
              <p className="mt-20 max-w-xs text-4xl leading-tight">
                Your harvest deserves a better journey.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-7 text-emerald-100">
                Book your mandi visit, follow your queue, and know exactly what
                happens next.
              </p>
            </div>
            <div className="flex items-end gap-3 text-emerald-100">
              <span className="text-5xl">🌾</span>
              <span className="text-xs leading-5">
                Fair procurement
                <br />
                starts with clarity.
              </span>
            </div>
          </div>
        </aside>

        <div className="p-7 sm:p-12">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] tracking-[1.5px] text-coral">
                WELCOME TO KRISHAK MITRA
              </p>
              <h1 className="mt-3 text-3xl text-forest">Sign in to continue</h1>
              <p className="mt-2 text-sm text-muted">
                Use your mobile number to access your mandi services.
              </p>
            </div>
            <LanguagePicker language={language} onChange={onLanguageChange} />
          </div>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <span>Want to test quickly? Use demo credentials.</span>
            <button
              type="button"
              onClick={fillDemo}
              className="rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
            >
              Fill Demo Login
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-lg bg-emerald-50 p-1">
            <button
              onClick={() => {
                setRole("farmer");
                setError("");
                setSent(false);
              }}
              className={`rounded-md p-3 text-sm ${role === "farmer" ? "bg-white text-forest shadow" : "text-muted"}`}
            >
              🌱 Farmer
            </button>
            <button
              onClick={() => {
                setRole("admin");
                setError("");
                setSent(false);
              }}
              className={`rounded-md p-3 text-sm ${role === "admin" ? "bg-white text-forest shadow" : "text-muted"}`}
            >
              ▣ Admin
            </button>
          </div>

          <form onSubmit={sent ? handleVerify : handleSendOtp} className="mt-7">
            <label className="block text-xs text-forest">
              Mobile number
              <div className="mt-2 flex">
                <span className="grid place-items-center rounded-l-md border border-r-0 border-line bg-slate-50 px-3 text-sm text-muted">
                  +91
                </span>
                <input
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  disabled={sent || loading}
                  placeholder="98765 43210"
                  className="w-full rounded-r-md border border-line p-3 text-sm outline-coral"
                  inputMode="numeric"
                />
              </div>
            </label>

            {sent && (
              <label className="mt-5 block text-xs text-forest">
                One-time password (Demo: 123456)
                <input
                  autoFocus
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={loading}
                  placeholder="Enter 6-digit OTP"
                  className="mt-2 w-full rounded-md border border-line p-3 text-sm tracking-[.4em] outline-coral"
                  inputMode="numeric"
                />
              </label>
            )}

            {role === "admin" && sent && (
              <label className="mt-5 block text-xs text-forest">
                Admin access key (Demo: MANDI-ADMIN)
                <input
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  disabled={loading}
                  placeholder="Enter admin key"
                  className="mt-2 w-full rounded-md border border-line p-3 text-sm outline-coral"
                  type="password"
                />
              </label>
            )}

            {error && (
              <p className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="mt-6 w-full rounded-md bg-coral p-3.5 text-sm text-white disabled:opacity-60"
            >
              {loading
                ? "Processing..."
                : sent
                  ? "Verify and sign in"
                  : "Send OTP"}{" "}
              <span className="ml-3">→</span>
            </button>

            {sent && (
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setOtp("");
                  setError("");
                }}
                disabled={loading}
                className="mt-3 w-full p-2 text-xs text-muted"
              >
                Change mobile number
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-[11px] leading-5 text-muted">
            By continuing, you agree to receive an OTP on your mobile number.
          </p>
        </div>
      </section>
    </main>
  );
}

export function AdminPage({ language, onLanguageChange, onLogout, t }) {
  const [centre, setCentre] = useState(null);
  const [booking, setBooking] = useState(() =>
    JSON.parse(localStorage.getItem("krishak-mitra-booking") || "null"),
  );
  const [status, setStatus] = useState("BOOKED");
  const [procurement, setProcurement] = useState(null);
  const [payment, setPayment] = useState(null);
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
            <p className="text-[10px] tracking-[1.5px] text-coral">
              TUESDAY, 18 JUNE 2024
            </p>
            <h1 className="mt-2 text-3xl">{t.adminGreeting}</h1>
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
                <p className="text-[10px] tracking-[1.5px] text-coral">
                  {t.liveOperations}
                </p>
                <h2 className="mt-2 text-xl">{t.queueAtCentre}</h2>

                {booking ? (
                  <div className="mt-5 rounded-md border border-line p-4 text-sm">
                    <span>
                      {booking.token?.token_number || "Token pending"}
                    </span>
                    <span className="mt-1 block text-muted">
                      Booking ID: {booking.booking.id}
                    </span>
                    <span className="mt-1 block text-muted">
                      Status: {status}
                    </span>
                    {procurement && (
                      <span className="mt-1 block text-muted">
                        Procurement: {procurement.procurement_status}
                      </span>
                    )}
                    {payment && (
                      <span className="mt-1 block text-muted">
                        Payment: {payment.payment_status}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    No booking data is available. Create a booking from the
                    farmer view first.
                  </p>
                )}
              </Panel>

              <Panel>
                <p className="text-[10px] tracking-[1.5px] text-coral">
                  {t.selectedBooking}
                </p>

                {booking ? (
                  <>
                    <h2 className="mt-4 text-xl">
                      {booking.token?.token_number || "Booking"}
                    </h2>
                    <label className="mt-6 block text-xs">
                      {t.updateStatus}
                      <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="mt-2 w-full rounded-md border border-line p-3 text-sm"
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
                      className="mt-5 w-full rounded-md bg-coral p-3 text-xs text-white disabled:opacity-60"
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
      <span className="my-3 block text-2xl">{value}</span>
      <small className="text-xs text-emerald-700">{detail}</small>
    </div>
  );
}