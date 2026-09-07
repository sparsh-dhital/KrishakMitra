export function Icon({ children }) {
  return (
    <span aria-hidden="true" className="mr-1.5">
      {children}
    </span>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    live: "bg-emerald-100 text-emerald-700",
    soft: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    neutral: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function LanguagePicker({ language, onChange }) {
  return (
    <label>
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-line bg-white px-2 py-2 text-xs font-semibold text-muted outline-coral"
      >
        {[
          ["en", "English"],
          ["hi", "हिन्दी"],
          ["te", "తెలుగు"],
          ["bn", "বাংলা"],
          ["mr", "मराठी"],
          ["ta", "தமிழ்"],
          ["kn", "ಕನ್ನಡ"],
          ["ml", "മലയാളം"],
          ["gu", "ગુજરાતી"],
          ["pa", "ਪੰਜਾਬੀ"],
          ["or", "ଓଡ଼ିଆ"],
          ["as", "অসমীয়া"],
        ].map(([code, label]) => (
          <option value={code} key={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Brand({ dark = false }) {
  return (
    <div
      className={`flex items-center gap-2 font-display text-[22px] font-bold tracking-tight ${dark ? "text-white" : "text-forest"}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral text-xs text-white">
        KM
      </span>
      <span>
        Krishak <span className="text-coral">Mitra</span>
      </span>
    </div>
  );
}

export function Header({ admin, language, onLanguageChange, onSwitch, t }) {
  return (
    <header
      className={`flex h-19 items-center justify-between border-b border-line px-4 sm:px-7 lg:px-[max(28px,calc((100%-1160px)/2))] ${admin ? "bg-forest text-white" : "bg-white"}`}
    >
      <Brand dark={admin} />
      <div className="hidden items-center gap-3 sm:flex">
        {admin && (
          <div className="mr-8 text-center">
            <div className="text-[9px] font-bold tracking-[1.3px] text-emerald-200">
              {t.adminPortal}
            </div>
            <div className="text-xs font-semibold">Rajasthan Mandi Centre</div>
          </div>
        )}
        <LanguagePicker language={language} onChange={onLanguageChange} />
        <span
          className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${admin ? "bg-orange-200 text-forest" : "bg-emerald-50 text-emerald-700"}`}
        >
          {admin ? "AD" : "AK"}
        </span>
      </div>
      <div className="sm:hidden">
        <LanguagePicker language={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-line bg-white p-5 shadow-[0_14px_35px_rgba(24,61,55,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

