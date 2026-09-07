import { useState } from "react";
import { motion } from "framer-motion";
import { LanguagePicker, Brand } from "../components/ui";
import { api } from "../services/api";

export default function LoginPage({ language, onLanguageChange, t, onLogin }) {
  const [role, setRole] = useState("farmer");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      <div className="absolute inset-0 z-0 bg-linear-to-t from-forest via-forest/90 to-forest/40" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        <div className="glass-panel-dark rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
            <Brand dark />
            <LanguagePicker language={language} onChange={onLanguageChange} />
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t?.signIn || "Sign In"}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-300">
              {t?.selectRole || "Select your role to access mandi procurement."}
            </p>
          </div>

          <div className="mt-6 sm:mt-8 flex rounded-full bg-slate-800/80 p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setRole("farmer");
                setError("");
                setSent(false);
              }}
              className={`flex-1 rounded-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all ${role === "farmer" ? "bg-brand text-white shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              {t?.farmerRole || "🌱 Farmer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setError("");
                setSent(false);
              }}
              className={`flex-1 rounded-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all ${role === "admin" ? "bg-white text-forest shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              {t?.adminRole || "🛡️ Admin"}
            </button>
          </div>

          <form
            onSubmit={sent ? handleVerify : handleSendOtp}
            className="mt-6 sm:mt-8"
          >
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
                  {t?.mobileNumber || "Mobile Number"}
                </label>
                <div className="flex relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm sm:text-base font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    disabled={sent || loading}
                    placeholder="98765 43210"
                    className="w-full rounded-xl bg-white py-3.5 sm:py-4 pl-14 pr-4 text-sm sm:text-base text-forest font-bold placeholder-slate-400 shadow-inner outline-none transition-all focus:ring-2 focus:ring-brand"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {sent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
                    {t?.oneTimePassword || "One-Time Password"}
                  </label>
                  <input
                    autoFocus
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={loading}
                    placeholder="••••••"
                    className="w-full rounded-xl bg-white p-3.5 sm:p-4 text-center text-xl sm:text-2xl tracking-[.5em] sm:tracking-[.75em] text-forest font-bold placeholder-slate-400 shadow-inner outline-none transition-all focus:ring-2 focus:ring-brand"
                    inputMode="numeric"
                  />
                </motion.div>
              )}

              {role === "admin" && sent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
                    {t?.adminKey || "Admin Key"}
                  </label>
                  <input
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    disabled={loading}
                    type="password"
                    placeholder={t?.enterAccessKey || "Enter access key"}
                    className="w-full rounded-xl bg-white p-3.5 sm:p-4 text-sm sm:text-base text-forest font-bold placeholder-slate-400 shadow-inner outline-none transition-all focus:ring-2 focus:ring-brand"
                  />
                </motion.div>
              )}
            </div>

            {error && (
              <div className="mt-5 rounded-xl bg-red-100 border border-red-200 p-3.5 text-xs sm:text-sm font-bold text-red-800">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="mt-6 sm:mt-8 w-full rounded-xl bg-brand py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-brand-hover shadow-lg disabled:opacity-65 active:scale-95"
            >
              {loading
                ? t?.processing || "Processing..."
                : sent
                  ? t?.verifyAndSignIn || "Verify & Sign In"
                  : t?.continue || "Continue"}
            </button>

            {sent && (
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setOtp("");
                  setError("");
                }}
                className="mt-5 w-full text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                {t?.changeMobileNumber || "Change mobile number"}
              </button>
            )}
          </form>
        </div>
      </motion.section>
    </main>
  );
}