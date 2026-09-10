import { forwardRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  LogOut,
  Check,
  MoreHorizontal,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  ChevronRight,
  Wifi,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import LanguagePicker from "./LanguagePicker";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = forwardRef(
  (
    { className, variant = "primary", size = "default", children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-harvest text-forest hover:bg-harvest-hover hover:shadow-md shadow-sm":
              variant === "primary",
            "bg-white text-forest border border-line hover:border-brand/30 hover:bg-slate-50 hover:shadow-sm":
              variant === "outline",
            "bg-forest text-white hover:bg-forest-dark hover:shadow-md shadow-sm":
              variant === "dark",
            "bg-transparent text-muted hover:text-forest hover:bg-slate-100":
              variant === "ghost",
            "h-8 px-4 text-xs": size === "sm",
            "h-12 px-6 text-sm": size === "default",
            "h-14 px-8 text-base": size === "lg",
            "h-12 w-12 p-0": size === "icon",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-forest transition-all placeholder:text-slate-400 hover:border-brand/40 focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1 focus:shadow-[0_0_0_3px_rgba(24,121,72,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
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
        "flex h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-forest transition-all hover:border-brand/40 focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1 focus:shadow-[0_0_0_3px_rgba(24,121,72,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export const Badge = forwardRef(
  ({ className, tone = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
          {
            "bg-slate-100 text-slate-700": tone === "default",
            "bg-[#E8F5E9] text-[#2E7D32]":
              tone === "success" || tone === "green",
            "bg-brand text-white": tone === "brand",
            "bg-[#FFF3E0] text-[#EF6C00]":
              tone === "warning" || tone === "amber",
            "bg-red-50 text-red-600": tone === "error",
            "bg-forest text-white": tone === "dark",
          },
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";

export const Card = forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface border border-line rounded-[26px] p-5 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

export function Eyebrow({ children, dark = false, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.18em]",
        dark ? "text-harvest" : "text-brand",
        className,
      )}
    >
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function CircularProgress({ value, label, subLabel }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-brand transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-xl text-forest">
            {value}%
          </span>
          <span className="text-[10px] text-muted font-bold uppercase">
            {label}
          </span>
        </div>
      </div>
      {subLabel && (
        <p className="text-xs font-bold text-muted mt-2">{subLabel}</p>
      )}
    </div>
  );
}

export function ProgressTimeline({ steps, currentStep }) {
  return (
    <div className="flex w-full mt-2 mb-4">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div key={idx} className="relative flex-1 flex flex-col items-center">
            {idx !== 0 && (
              <div className="absolute top-4 -left-1/2 w-full h-[3px] bg-slate-100 -z-0">
                <div
                  className="h-full bg-brand transition-all duration-700 ease-out"
                  style={{ width: isCompleted || isCurrent ? "100%" : "0%" }}
                />
              </div>
            )}

            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 bg-surface z-10 relative",
                isCompleted
                  ? "border-harvest bg-forest text-harvest shadow-md"
                  : isCurrent
                    ? "border-harvest text-harvest ring-4 ring-harvest/20 shadow-sm bg-white"
                    : "border-[#dce6d7] text-[#c8d9c6]",
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 font-bold" />
              ) : isCurrent ? (
                <div className="w-2.5 h-2.5 rounded-full bg-harvest animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#dce6d7]" />
              )}
            </div>

            <div className="text-center mt-3 px-1 w-full">
              <span
                className={cn(
                  "block text-[11px] sm:text-xs font-bold transition-colors duration-300 leading-tight",
                  isCompleted || isCurrent ? "text-forest" : "text-slate-400",
                )}
              >
                {step.title}
              </span>
              <span
                className={cn(
                  "block text-[10px] font-medium transition-colors duration-300 mt-1 truncate",
                  isCurrent ? "text-forest font-bold" : "text-muted",
                )}
              >
                {step.subtitle ||
                  (isCompleted
                    ? "Done"
                    : isCurrent
                      ? "In Progress"
                      : "Pending")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return (
    <div className="hidden md:flex flex-col items-end leading-none">
      <span className="text-sm font-extrabold text-forest tabular-nums">
        {time}
      </span>
      <span className="text-[10px] text-muted font-medium mt-0.5">{date}</span>
    </div>
  );
}

export function SidebarLayout({
  children,
  activeTab,
  onTabChange,
  navItems,
  onLogout,
  onHome,
  onProfile,
  language,
  onLanguageChange,
  displayName = "Ramesh Kumar",
  roleLabel,
}) {
  const { t } = useTranslation();
  const defaultRoleLabel = roleLabel || t("greetingFarmer");
  const [moreOpen, setMoreOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const primaryNavItems = navItems.slice(0, 4);
  const secondaryNavItems = navItems.slice(4);

  function selectMobileTab(tabId) {
    onTabChange(tabId);
    setMoreOpen(false);
  }

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-cream">
      <aside
        className={cn(
          "hidden lg:flex bg-[#113524] flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shadow-2xl overflow-hidden",
          isExpanded ? "w-[260px]" : "w-[72px]",
        )}
      >
        <div
          className={cn(
            "px-3 py-4 flex items-center border-b border-white/10 transition-all duration-300",
            isExpanded ? "justify-between px-4" : "justify-center",
          )}
        >
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              isExpanded
                ? "opacity-100 max-w-full"
                : "opacity-0 max-w-0 pointer-events-none",
            )}
          >
            <Logo variant="text" className="h-7 w-auto" dark={true} />
          </div>

          <div
            className={cn(
              "transition-all duration-300 shrink-0",
              !isExpanded
                ? "opacity-100"
                : "opacity-0 w-0 overflow-hidden pointer-events-none",
            )}
          >
            <Logo variant="emblem" className="h-10 w-10" />
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className={cn(
              "ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              isExpanded
                ? "opacity-100"
                : "opacity-0 w-0 overflow-hidden pointer-events-none p-0 ml-0 border-none",
            )}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {!isExpanded && (
          <div className="flex justify-center py-2.5 border-b border-white/10">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          className={cn(
            "px-4 py-4 border-b border-white/10 flex items-center transition-all duration-300",
            isExpanded ? "justify-between" : "justify-center px-2",
          )}
        >
          <button
            type="button"
            onClick={onProfile}
            className="flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-inner">
              SM
            </div>
            <div
              className={cn(
                "whitespace-nowrap overflow-hidden transition-all duration-300",
                isExpanded ? "opacity-100 w-32 ml-1" : "opacity-0 w-0 ml-0",
              )}
            >
              <p className="text-xs text-harvest font-bold">
                {defaultRoleLabel}
              </p>
              <p className="text-sm text-white font-bold truncate max-w-[150px]">
                {displayName}
              </p>
            </div>
          </button>
        </div>

        <nav
          className={cn(
            "flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide overflow-x-hidden",
            isExpanded ? "" : "px-2",
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center w-full py-3 rounded-xl text-sm font-bold transition-all relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0b291d]",
                  isActive
                    ? "bg-white/10 text-harvest shadow-md border border-white/5"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                  isExpanded ? "gap-3 px-4" : "justify-center px-0",
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-harvest"
                      : "text-white/50 group-hover:text-white",
                  )}
                />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    isExpanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4 absolute",
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div
          className={cn(
            "p-3 border-t border-white/10",
            isExpanded ? "" : "px-2",
          )}
        >
          <button
            onClick={onHome}
            className={cn(
              "flex items-center w-full py-3 rounded-xl text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] shadow-sm transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-forest",
              isExpanded ? "gap-3 px-4" : "justify-center px-0",
            )}
            title={!isExpanded ? t("ui.home") : undefined}
          >
            <Home className="w-5 h-5 shrink-0 text-white" />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-300 capitalize",
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 absolute",
              )}
            >
              {t("ui.home")}
            </span>
          </button>
        </div>
      </aside>

      <main
        className={cn(
          "min-w-0 flex-1 pb-20 lg:pb-0 transition-all duration-300 ease-in-out",
          isExpanded ? "lg:pl-[260px]" : "lg:pl-[72px]",
        )}
      >
        <header className="h-[72px] border-b border-line/50 bg-white/70 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex h-full items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <Logo variant="emblem" className="w-8 h-8 drop-shadow-sm" />
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm font-medium shrink-0 bg-slate-50/80 px-3 py-1.5 rounded-full border border-slate-100">
              <span className="text-muted font-bold">{t("ui.dashboard")}</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-forest font-extrabold">
                {navItems.find((n) => n.id === activeTab)?.label ||
                  t("overview")}
              </span>
            </div>

            <div className="flex-1 max-w-md mx-auto hidden md:block pl-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand transition-colors" />
                <input
                  type="text"
                  placeholder={t("ui.searchPlaceholder")}
                  className="w-full bg-slate-100/50 border border-slate-200/60 rounded-full pl-10 pr-4 py-2.5 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/10 transition-all outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
              <LiveClock />

              <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

              <LanguagePicker value={language} onChange={onLanguageChange} />

              <button
                onClick={() => {
                  const target = navItems.find(
                    (n) => n.id === "notifications" || n.id === "reports",
                  );
                  if (target) onTabChange(target.id);
                }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-brand hover:bg-brand/5 transition-all focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              </button>

              <button
                type="button"
                onClick={onProfile}
                className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-emerald-400 flex items-center justify-center text-white text-sm font-extrabold shadow-md shrink-0 border border-white">
                  {displayName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="hidden lg:block leading-tight">
                  <p className="text-sm font-extrabold text-forest">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-muted font-bold tracking-wider uppercase mt-0.5">
                    {defaultRoleLabel}
                  </p>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="w-10 h-10 ml-1 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                title={t("logout")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      {moreOpen && secondaryNavItems.length > 0 && (
        <div className="lg:hidden fixed inset-x-3 bottom-[4.75rem] z-50 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-bold text-forest">
              {t("ui.more")}
            </span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-lg px-2 py-1 text-xs font-bold text-muted hover:bg-slate-50"
              aria-label="Close menu"
            >
              <span aria-hidden="true"></span>
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
                    isActive
                      ? "bg-green-50 text-brand"
                      : "text-forest hover:bg-slate-50",
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
                isActive ? "text-brand" : "text-muted",
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "text-brand" : "")} />
              <span className="max-w-full break-words text-center text-[10px] leading-tight font-bold">
                {item.label}
              </span>
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
              moreOpen ||
                secondaryNavItems.some((item) => item.id === activeTab)
                ? "text-brand"
                : "text-muted",
            )}
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="max-w-full break-words text-center text-[10px] leading-tight font-bold">
              More
            </span>
          </button>
        )}
      </nav>
    </div>
  );
}
