/**
 * LanguagePicker — beautiful dropdown for 12 Indian languages.
 * Shows native script name + English label. Fully keyboard-accessible.
 */
import { useState, useRef, useEffect } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { languageOptions } from "../i18n";

export default function LanguagePicker({ value, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handle(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const current = languageOptions.find((l) => l.code === value) || languageOptions[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-line bg-surface hover:bg-slate-50 text-sm font-bold text-forest transition-all focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <Languages className="w-4 h-4 text-brand shrink-0" />
        <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown
          className={`w-3 h-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-1.5rem))] bg-white border border-line rounded-2xl shadow-xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="p-2 max-h-80 overflow-y-auto">
            {languageOptions.map((lang) => {
              const isActive = lang.code === value;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                    isActive
                      ? "bg-green-50 text-forest"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {/* Native name in its own script */}
                    <span className={`font-bold ${isActive ? "text-forest" : "text-slate-800"}`}>
                      {lang.native}
                    </span>
                    {/* English label */}
                    <span className="text-xs text-muted font-medium">{lang.label}</span>
                  </span>
                  {isActive && <Check className="w-4 h-4 text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
