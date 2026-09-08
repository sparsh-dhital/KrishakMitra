import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LogOut, Check, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import LanguagePicker from "./LanguagePicker";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-brand text-white hover:bg-brand-hover": variant === "primary",
          "bg-white text-forest border border-line hover:border-brand/30 hover:bg-slate-50": variant === "outline",
          "bg-forest text-white hover:bg-forest-dark": variant === "dark",
          "bg-transparent text-muted hover:text-forest hover:bg-slate-100": variant === "ghost",
          "h-8 px-4 text-xs": size === "sm",
          "h-12 px-6 text-sm": size === "default",
          "h-14 px-8 text-base": size === "lg",
          "h-12 w-12 p-0": size === "icon",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-forest transition-all placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Select = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-forest transition-all focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export const Badge = forwardRef(({ className, tone = "default", children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        {
          "bg-slate-100 text-slate-700": tone === "default",
          "bg-[#E8F5E9] text-[#2E7D32]": tone === "success" || tone === "green",
          "bg-brand text-white": tone === "brand",
          "bg-[#FFF3E0] text-[#EF6C00]": tone === "warning" || tone === "amber",
          "bg-red-50 text-red-600": tone === "error",
          "bg-forest text-white": tone === "dark",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
Badge.displayName = "Badge";

export const Card = forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("bg-surface border border-line rounded-3xl p-6 transition-all duration-300", className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

export function CircularProgress({ value, label, subLabel }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
          <circle 
            cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-brand transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-xl text-forest">{value}%</span>
          <span className="text-[10px] text-muted font-bold uppercase">{label}</span>
        </div>
      </div>
      {subLabel && <p className="text-xs font-bold text-muted mt-2">{subLabel}</p>}
    </div>
  );
}

export function ProgressTimeline({ steps, currentStep }) {
  return (
    <div className="w-full grid grid-cols-5 gap-1 sm:flex sm:items-center sm:justify-between relative mt-4 mb-2">
      <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-100 -z-10" />
      <div 
        className="absolute left-4 top-4 h-0.5 bg-brand -z-10 transition-all duration-500" 
        style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 2rem)` }}
      />
      {steps.map((step, idx) => {
        const isCompleted = idx <= currentStep;
        return (
          <div key={idx} className="min-w-0 flex flex-col items-center gap-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors border-4 border-surface", isCompleted ? "bg-brand text-white" : "bg-slate-200 text-slate-400")}>
              {isCompleted ? <Check className="w-4 h-4" /> : <span className="w-2 h-2 rounded-full bg-current" />}
            </div>
            <div className="text-center">
              <span className="block max-w-full break-words text-xs font-bold text-forest">{step.title}</span>
              <span className="block max-w-full break-words text-[10px] text-muted">{step.subtitle || (isCompleted ? "Completed" : "Pending")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SidebarLayout({ children, activeTab, onTabChange, navItems, onLogout, language, onLanguageChange }) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryNavItems = navItems.slice(0, 4);
  const secondaryNavItems = navItems.slice(4);

  function selectMobileTab(tabId) {
    onTabChange(tabId);
    setMoreOpen(false);
  }

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-cream">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-forest flex-col fixed inset-y-0 left-0 z-50">
        {/* Sidebar logo — full logo in white pill so it reads on dark green */}
        <div className="px-5 py-4 flex flex-col items-center border-b border-white/5">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-md">
            <Logo variant="full" className="h-12 w-auto" />
          </div>
        </div>
        
        <div className="p-6 pb-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">SM</div>
            <div>
              <p className="text-xs text-brand font-bold">{t("greetingFarmer")}</p>
              <p className="text-sm text-white font-bold">Ramesh Kumar</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  isActive ? "bg-brand/20 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-brand" : "")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <LogOut className="w-5 h-5" /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 pb-20 lg:pl-[260px] lg:pb-0">
        {/* Top Header */}
        <header className="h-16 border-b border-line bg-surface flex items-center px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
          {/* Mobile: show emblem (hidden on desktop since sidebar shows full logo) */}
          <div className="flex items-center gap-2 lg:hidden">
            <Logo variant="emblem" className="w-9 h-9" />
          </div>

          {/* Controls — always pinned to the right */}
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <LanguagePicker value={language} onChange={onLanguageChange} />

            <button
              onClick={onLogout}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-all border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </header>
        
        <div className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      {moreOpen && secondaryNavItems.length > 0 && (
        <div className="lg:hidden fixed inset-x-3 bottom-[4.75rem] z-50 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-bold text-forest">More</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-lg px-2 py-1 text-xs font-bold text-muted hover:bg-slate-50"
              aria-label="Close menu"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMobileTab(item.id)}
                  className={cn(
                    "flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition-all",
                    isActive ? "bg-green-50 text-brand" : "text-forest hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="break-words">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line z-50 flex items-center justify-around p-2 pb-safe">
        {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectMobileTab(item.id)}
                type="button"
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  isActive ? "text-brand" : "text-muted"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive ? "text-brand" : "")} />
                <span className="max-w-full break-words text-center text-[10px] leading-tight font-bold">{item.label}</span>
              </button>
            );
          })}
        {secondaryNavItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl p-2 transition-all",
              moreOpen || secondaryNavItems.some((item) => item.id === activeTab) ? "text-brand" : "text-muted"
            )}
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="max-w-full break-words text-center text-[10px] leading-tight font-bold">More</span>
          </button>
        )}
      </nav>
    </div>
  );
}