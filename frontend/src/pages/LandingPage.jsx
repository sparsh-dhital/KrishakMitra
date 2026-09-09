import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Leaf,
  MapPin,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Ticket,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo";
import LanguagePicker from "../components/LanguagePicker";
import heroImage from "../assets/bg-land.png";

const journey = [
  ["01", 0, MapPin],
  ["02", 1, SlidersHorizontal],
  ["03", 2, Ticket],
  ["04", 3, Clock3],
  ["05", 4, CheckCircle2],
  ["06", 5, CreditCard],
];
const features = [
  [Eye, 0],
  [SlidersHorizontal, 1],
  [Ticket, 2],
  [Activity, 3],
  [ShieldCheck, 4],
  [CreditCard, 5],
  [Smartphone, 6],
  [Users, 7],
];
function Label({ children, dark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.18em] ${dark ? "text-lime-200" : "text-brand"}`}
    >
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <Logo variant="emblem" className="h-12 w-12" />
      <span className="font-display text-xl font-extrabold tracking-[-.04em] text-white">
        Krishak<span className="text-[#b7ef62]">Mitra</span>
      </span>
    </span>
  );
}

export default function LandingPage({
  onNavigateLogin,
  onNavigateContact,
  hasSession,
  language,
  onLanguageChange,
}) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const cta = hasSession
    ? t("landing.nav.openDashboard")
    : t("landing.hero.book");
  const promiseItems = t("landing.promise.items", { returnObjects: true });
  const impactItems = t("landing.impact.items", { returnObjects: true });
  const centreRows = t("landing.centre.rows", { returnObjects: true });
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7f1] font-body text-forest selection:bg-brand selection:text-white">
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 bg-forest/25 text-white backdrop-blur-md">
        <div className="mx-auto flex h-19 max-w-345 items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="#top">
            <BrandMark />
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
            <a href="#features" className="text-white/75 hover:text-white">
              {t("landing.nav.features")}
            </a>
            <a href="#journey" className="text-white/75 hover:text-white">
              {t("landing.nav.journey")}
            </a>
            <a href="#impact" className="text-white/75 hover:text-white">
              {t("landing.nav.impact")}
            </a>
            <button
              onClick={onNavigateContact}
              className="text-white/75 hover:text-white"
            >
              {t("landing.nav.contact")}
            </button>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <LanguagePicker
              value={language}
              onChange={onLanguageChange}
              className="[&>button]:border-white/25 [&>button]:bg-white/10 [&>button]:text-white [&>button]:shadow-none [&>button:hover]:bg-white/10! [&>button:focus]:bg-white/10! [&>button:active]:bg-white/10! [&>button[aria-expanded=true]]:bg-white/10!"
            />
            <button
              onClick={onNavigateLogin}
              className="rounded-full bg-[#b7ef62] px-5 py-3 text-sm font-extrabold text-forest hover:bg-white"
            >
              {hasSession ? t("landing.nav.dashboard") : t("landing.nav.login")}
            </button>
          </div>
          <button
            type="button"
            aria-label={t("landing.nav.menu")}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full border border-white/25 p-2.5 sm:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-white/15 bg-[#103c2a] p-5 text-sm font-semibold sm:hidden">
            <a href="#features" className="p-3">
              {t("landing.nav.features")}
            </a>
            <a href="#journey" className="p-3">
              {t("landing.nav.journey")}
            </a>
            <a href="#impact" className="p-3">
              {t("landing.nav.impact")}
            </a>
            <button onClick={onNavigateContact} className="p-3 text-left">
              {t("landing.nav.contact")}
            </button>
            <button
              onClick={onNavigateLogin}
              className="mt-2 rounded-xl bg-[#b7ef62] p-3 text-left text-forest"
            >
              {cta}
            </button>
          </nav>
        )}
      </header>
      <main id="top">
        <section className="relative isolate min-h-180 overflow-hidden bg-[#123b2a] pt-32 text-white sm:min-h-195 lg:min-h-210 lg:pt-40">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-position-[center_58%] sm:bg-position-[center_52%] lg:bg-position-[center_48%]"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,35,24,.82),rgba(8,54,34,.58),rgba(8,50,29,.3))]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#123b2a,transparent_34%)]" />
          <div className="mx-auto flex min-w-0 max-w-345 justify-center px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto max-w-3xl text-center"
            >
              <Label dark>{t("landing.hero.eyebrow")}</Label>
              <h1 className="mt-6 font-display text-[clamp(2.7rem,5.5vw,5.35rem)] font-extrabold leading-[.98] tracking-tighter">
                {t("landing.hero.title1")}
                <br />
                {t("landing.hero.title2")}
                <br />
                <span className="text-[#b7ef62]">
                  {t("landing.hero.title3")}
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-xl text-center text-base leading-7 text-white/78 sm:text-lg">
                {t("landing.hero.description")}
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={onNavigateLogin}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#b7ef62] px-6 py-4 text-sm font-extrabold text-forest hover:bg-white"
                >
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onNavigateContact}
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-4 text-sm font-extrabold hover:bg-white/20"
                >
                  {t("landing.hero.contact")}
                </button>
              </div>
              <div className="mt-12 flex flex-wrap justify-center gap-7 text-xs font-semibold text-white/65">
                <span>
                  <Check className="mr-2 inline h-4 w-4 text-[#b7ef62]" />
                  {t("landing.hero.farmer")}
                </span>
                <span>
                  <Check className="mr-2 inline h-4 w-4 text-[#b7ef62]" />
                  {t("landing.hero.centre")}
                </span>
                <span>
                  <Check className="mr-2 inline h-4 w-4 text-[#b7ef62]" />
                  {t("landing.hero.visits")}
                </span>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="mx-auto grid max-w-345 gap-8 border-y border-[#dce6d7] py-8 md:grid-cols-[1.1fr_2fr] lg:py-10">
            <div>
              <Label>{t("landing.promise.eyebrow")}</Label>
              <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
                {t("landing.promise.title")}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {promiseItems.map(([a, b]) => (
                <div key={a}>
                  <p className="font-display text-lg font-extrabold">{a}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="journey" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-345">
            <Label>{t("landing.journey.eyebrow")}</Label>
            <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tighter sm:text-6xl">
              {t("landing.journey.title1")}
              <br />
              <span className="text-brand">{t("landing.journey.title2")}</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              {t("landing.journey.description")}
            </p>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-6">
              {journey.map(([num, index, Icon], i) => {
                const [title, text] = t(`landing.journey.steps.${index}`, {
                  returnObjects: true,
                });
                return (
                  <motion.div
                    key={num}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 18 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="border-t-2 border-[#c8d9c6] pt-5 lg:min-h-52.5 lg:border-t-0"
                  >
                    <div className="flex justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-[#b7ef62]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <b className="font-display text-4xl text-[#cfdfcd]">
                        {num}
                      </b>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-extrabold">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        <section
          id="features"
          className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
        >
          <div className="mx-auto max-w-345">
            <Label>{t("landing.features.eyebrow")}</Label>
            <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tighter sm:text-6xl">
              {t("landing.features.title1")}
              <br />
              <span className="text-brand">{t("landing.features.title2")}</span>
            </h2>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(([Icon, index], i) => {
                const [title, text] = t(`landing.features.items.${index}`, {
                  returnObjects: true,
                });
                return (
                  <motion.article
                    key={title}
                    whileHover={{ y: -5 }}
                    className={`min-h-52.5 border p-6 hover:shadow-xl ${i === 0 ? "border-forest bg-forest text-white" : "border-[#dce6d7] bg-[#f7f9f4]"}`}
                  >
                    <Icon
                      className={i === 0 ? "text-[#b7ef62]" : "text-brand"}
                    />
                    <h3 className="mt-12 font-display text-lg font-extrabold">
                      {title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${i === 0 ? "text-white/65" : "text-muted"}`}
                    >
                      {text}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="bg-[#e6efdf] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-345 gap-10 lg:grid-cols-2 lg:gap-20">
            <div>
              <Label>{t("landing.farmer.eyebrow")}</Label>
              <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tighter sm:text-6xl">
                {t("landing.farmer.title1")}
                <br />
                <span className="text-brand">{t("landing.farmer.title2")}</span>
              </h2>
              <p className="mt-6 max-w-md text-base leading-7 text-muted">
                {t("landing.farmer.description")}
              </p>
              <p className="mt-8 text-sm font-bold">
                <UserRound className="mr-2 inline text-brand" />
                {t("landing.farmer.note")}
              </p>
            </div>
            <div className="rounded-[26px] bg-white p-5 shadow-xl sm:p-7">
              <div className="flex justify-between border-b border-[#e2ebe0] pb-5">
                <div>
                  <p className="text-xs text-muted">
                    {t("landing.farmer.greeting")}
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold">
                    {t("landing.farmer.slot")}
                  </p>
                </div>
                <b className="h-fit rounded-full bg-[#e8f5d0] px-3 py-1.5 text-[10px] uppercase text-brand">
                  {t("landing.farmer.active")}
                </b>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [MapPin, t("landing.farmer.centre"), "Nashik Mandi"],
                  [Ticket, t("landing.farmer.token"), "A-042"],
                  [Clock3, t("landing.farmer.wait"), "12 min"],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="rounded-2xl bg-[#f2f6ee] p-4">
                    <Icon className="h-4 w-4 text-brand" />
                    <p className="mt-4 text-xs text-muted">{label}</p>
                    <p className="mt-1 text-sm font-extrabold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-[#dce6d7] p-4">
                <div className="flex justify-between text-xs font-bold">
                  <span>{t("landing.farmer.progress")}</span>
                  <span className="text-brand">3 of 5</span>
                </div>
                <div className="mt-4 flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i
                      key={i}
                      className={`h-2 flex-1 rounded-full ${i <= 3 ? "bg-brand" : "bg-[#e2ebe0]"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm font-bold text-brand">
                  {t("landing.farmer.next")}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="impact"
          className="bg-[#123b2a] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12"
        >
          <div className="mx-auto max-w-345">
            <Label dark>{t("landing.impact.eyebrow")}</Label>
            <h2 className="mt-5 font-display text-4xl font-extrabold sm:text-6xl">
              {t("landing.impact.title1")}
              <br />
              <span className="text-[#b7ef62]">
                {t("landing.impact.title2")}
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
              {t("landing.impact.description")}
            </p>
            <div className="mt-14 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-5">
              {impactItems.map(([title, text], i) => (
                <div
                  key={title}
                  className={`p-6 ${i === 4 ? "bg-[#b7ef62] text-forest" : "bg-forest"}`}
                >
                  <p className="font-display text-xl font-extrabold">{title}</p>
                  <p className="mt-3 text-sm leading-6 opacity-60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-345 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Label>{t("landing.centre.eyebrow")}</Label>
              <h2 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
                {t("landing.centre.title")}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted">
                {t("landing.centre.description")}
              </p>
              <p className="mt-8 text-sm font-bold">
                <Users className="mr-2 inline text-brand" />
                {t("landing.centre.note")}
              </p>
            </div>
            <div className="rounded-[26px] bg-white p-5 shadow-xl sm:p-7">
              <p className="text-xs text-muted">
                {t("landing.centre.console")}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold">
                {t("landing.centre.glance")}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["24", t("landing.centre.bookings")],
                  ["08", t("landing.centre.queue")],
                  ["62%", t("landing.centre.capacity")],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-2xl bg-[#f2f6ee] p-3">
                    <p className="font-display text-2xl font-extrabold">{v}</p>
                    <p className="text-[11px] font-bold text-muted">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {centreRows
                  .map(([status, time], index) => [
                    `A-0${42 + index}`,
                    status,
                    time,
                  ])
                  .map(([a, b, c]) => (
                    <div
                      key={a}
                      className="flex gap-3 border-b border-[#edf1eb] pb-3 text-sm"
                    >
                      <b className="text-brand">{a}</b>
                      <span className="flex-1 font-semibold">{b}</span>
                      <span className="text-xs text-muted">{c}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
        <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
          <div className="mx-auto max-w-345 bg-[#b7ef62] px-6 py-14 text-center sm:px-12 sm:py-20">
            <Leaf className="mx-auto text-forest" />
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold text-forest sm:text-6xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-forest/70">
              {t("landing.cta.description")}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={onNavigateLogin}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-forest px-6 py-4 text-sm font-extrabold text-white hover:bg-white hover:text-forest"
              >
                {cta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onNavigateContact}
                className="inline-flex items-center justify-center rounded-full border border-forest/25 bg-transparent px-6 py-4 text-sm font-extrabold text-forest hover:bg-white"
              >
                {t("landing.hero.contact")}
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[#0b291d] px-5 py-14 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-345 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandMark />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
              {t("landing.footer.description")}
            </p>
          </div>
          <div>
            <Label dark>{t("landing.footer.explore")}</Label>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <a href="#features">{t("landing.nav.features")}</a>
              <a href="#journey">{t("landing.nav.journey")}</a>
              <a href="#impact">{t("landing.nav.impact")}</a>
            </div>
          </div>
          <div>
            <Label dark>{t("landing.footer.access")}</Label>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <button onClick={onNavigateLogin} className="text-left">
                {t("landing.nav.login")}
              </button>
              <button onClick={onNavigateContact} className="text-left">
                {t("landing.footer.support")}
              </button>
            </div>
          </div>
          <div>
            <Label dark>{t("landing.footer.built")}</Label>
            <p className="mt-5 text-sm leading-6 text-white/60">
              {t("landing.footer.builtText")}
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-345 border-t border-white/10 pt-6 text-xs text-white/35">
          © {new Date().getFullYear()} KrishakMitra.{" "}
          {t("landing.footer.copyright")}
        </div>
      </footer>
    </div>
  );
}
