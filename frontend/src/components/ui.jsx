import { Globe, LogOut } from "lucide-react";

export function Icon({ children }) {
  return (
    <span aria-hidden="true" className="mr-2 flex items-center">
      {children}
    </span>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    live: "bg-green-100 text-green-800 border border-green-300",
    soft: "bg-white text-forest border border-slate-200",
    amber: "bg-amber-100 text-amber-800 border border-amber-300",
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function LanguagePicker({ language, onChange }) {
  return (
    <div className="relative flex items-center">
      <Globe className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none hidden sm:block" />
      <select
        value={language}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-full border border-slate-300 bg-white py-2 sm:py-2.5 pl-3 sm:pl-9 pr-8 text-xs sm:text-sm font-bold text-slate-800 shadow-sm outline-none transition-all hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20 cursor-pointer"
      >
        {[
          ["en", "English"],
          ["hi", "हिन्दी"],
          ["te", "తెలుగు"],
          ["mr", "मराठी"],
          ["bn", "বাংলা"],
        ].map(([code, label]) => (
          <option
            value={code}
            key={code}
            className="text-slate-900 font-medium"
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Brand({ dark = false }) {
  return (
    <div
      className={`flex items-center gap-2 font-display text-base sm:text-xl font-bold tracking-tight ${dark ? "text-white" : "text-forest"}`}
    >
      <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-brand text-xs sm:text-sm text-white shadow-md font-bold shrink-0">
        KM
      </span>
      <span className="truncate">
        Krishak<span className="text-brand">Mitra</span>
      </span>
    </div>
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
    <header className="fixed top-3 sm:top-4 left-1/2 z-50 w-[96%] sm:w-[95%] max-w-7xl -translate-x-1/2">
      <div
        className={`flex h-16 sm:h-18 items-center justify-between rounded-full px-4 sm:px-8 shadow-xl transition-all border ${
          admin
            ? "bg-forest text-white border-emerald-900 shadow-emerald-950/20"
            : "bg-white/95 backdrop-blur-md text-slate-900 border-slate-200/80"
        }`}
      >
        <Brand dark={admin} />

        <div className="hidden md:flex flex-1 items-center justify-center px-4">
          <span
            className={`text-xs sm:text-sm font-extrabold tracking-wider uppercase px-4 py-1.5 rounded-full truncate max-w-xs ${
              admin
                ? "bg-white/10 text-emerald-100 border border-white/10"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {centreName || (admin ? t.adminPortal : t.farmerPortal)}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguagePicker language={language} onChange={onLanguageChange} />
          <button
            onClick={onLogout}
            className={`flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm ${
              admin
                ? "bg-white text-forest hover:bg-emerald-50"
                : "bg-forest text-white hover:bg-emerald-900"
            }`}
          >
            <span className="hidden xs:inline sm:inline">{t.logout}</span>
            <LogOut className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-lg border border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}