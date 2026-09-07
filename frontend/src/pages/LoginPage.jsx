import { useState } from "react";
import { LanguagePicker } from "../components/ui";

const DEMO_OTP = "123456";
const DEMO_ADMIN_KEY = "MANDI-ADMIN";

export default function LoginPage({ language, onLanguageChange, onLogin }) {
  const [role, setRole] = useState("farmer");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function sendOtp(event) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setSent(true);
  }

  function verify(event) {
    event.preventDefault();
    if (otp !== DEMO_OTP) {
      setError("Incorrect OTP. Use the demo OTP 123456.");
      return;
    }
    if (role === "admin" && adminKey !== DEMO_ADMIN_KEY) {
      setError("Invalid admin key. Use the configured admin key.");
      return;
    }
    setError("");
    onLogin(role, mobile);
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 px-4 py-8"><div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-emerald-800/60" /><div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full border border-emerald-800/60" /><section className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[.9fr_1.1fr]"><aside className="relative hidden overflow-hidden bg-forest p-10 text-white lg:block"><div className="absolute -right-24 top-16 h-72 w-72 rounded-full border border-emerald-200/20" /><div className="relative z-10 flex h-full flex-col justify-between"><div><div className="flex items-center gap-2 font-display text-2xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-lg bg-coral text-xs">KM</span>Krishak <span className="text-orange-200">Mitra</span></div><p className="mt-20 max-w-xs font-display text-4xl font-bold leading-tight">Your harvest deserves a better journey.</p><p className="mt-5 max-w-sm text-sm leading-7 text-emerald-100">Book your mandi visit, follow your queue, and know exactly what happens next.</p></div><div className="flex items-end gap-3 text-emerald-100"><span className="text-5xl">🌾</span><span className="text-xs leading-5">Fair procurement<br />starts with clarity.</span></div></div></aside><div className="p-7 sm:p-12"><div className="flex justify-between"><div><p className="text-[10px] font-bold tracking-[1.5px] text-coral">WELCOME TO KRISHAK MITRA</p><h1 className="mt-3 font-display text-3xl font-bold text-forest">Sign in to continue</h1><p className="mt-2 text-sm text-muted">Use your mobile number to access your mandi services.</p></div><LanguagePicker language={language} onChange={onLanguageChange} /></div><div className="mt-9 grid grid-cols-2 rounded-lg bg-emerald-50 p-1"><button onClick={() => { setRole("farmer"); setError(""); }} className={`rounded-md p-3 text-sm font-semibold ${role === "farmer" ? "bg-white text-forest shadow" : "text-muted"}`}>🌱 Farmer</button><button onClick={() => { setRole("admin"); setError(""); }} className={`rounded-md p-3 text-sm font-semibold ${role === "admin" ? "bg-white text-forest shadow" : "text-muted"}`}>▣ Admin</button></div><form onSubmit={sent ? verify : sendOtp} className="mt-7"><label className="block text-xs font-bold text-forest">Mobile number<div className="mt-2 flex"><span className="grid place-items-center rounded-l-md border border-r-0 border-line bg-slate-50 px-3 text-sm text-muted">+91</span><input value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))} disabled={sent} placeholder="98765 43210" className="w-full rounded-r-md border border-line p-3 text-sm outline-coral" inputMode="numeric" /></div></label>{sent && <label className="mt-5 block text-xs font-bold text-forest">One-time password<input autoFocus value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit OTP" className="mt-2 w-full rounded-md border border-line p-3 text-sm tracking-[.4em] outline-coral" inputMode="numeric" /></label>}{role === "admin" && sent && <label className="mt-5 block text-xs font-bold text-forest">Admin access key<input value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Enter admin key" className="mt-2 w-full rounded-md border border-line p-3 text-sm outline-coral" type="password" /></label>}{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-700">{error}</p>}<button className="mt-6 w-full rounded-md bg-coral p-3.5 text-sm font-bold text-white">{sent ? "Verify and sign in" : "Send OTP"} <span className="ml-3">→</span></button>{sent && <button type="button" onClick={() => { setSent(false); setOtp(""); setError(""); }} className="mt-3 w-full p-2 text-xs font-semibold text-muted">Change mobile number</button>}</form><p className="mt-8 text-center text-[11px] leading-5 text-muted">By continuing, you agree to receive an OTP on your mobile number.</p></div></section></main>;
}

