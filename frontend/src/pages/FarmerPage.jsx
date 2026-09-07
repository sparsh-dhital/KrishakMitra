import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  CalendarPlus,
  ListOrdered,
  CheckCircle2,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { api, config, isUuid, toUiSlot } from "../services/api";
import { Badge, Header, Panel } from "../components/ui";

const navItems = (t) => [
  ["home", HomeIcon, t.overview],
  ["book", CalendarPlus, t.bookSlot],
  ["queue", ListOrdered, t.liveQueue],
  ["status", CheckCircle2, t.myStatus],
];

export default function FarmerPage({
  language,
  onLanguageChange,
  onLogout,
  t,
}) {
  const [tab, setTab] = useState("home");
  const [centres, setCentres] = useState([]);
  const [farmer, setFarmer] = useState(null);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [quantity, setQuantity] = useState(40);

  const [booking, setBooking] = useState(() => {
    try {
      const saved = localStorage.getItem("krishak-mitra-booking");
      return !saved || saved === "undefined" ? null : JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [queueEntry, setQueueEntry] = useState(null);
  const [procurement, setProcurement] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCentres() {
    setLoading(true);
    try {
      const [centreData, cropData] = await Promise.all([
        api.getCentres(),
        api.getCrops(),
      ]);
      setCentres(centreData);
      setCrops(cropData);
      setSelectedCrop(
        (current) =>
          current || booking?.booking?.crop_id || cropData?.[0]?.id || "",
      );
      setSelectedCentre((current) => current || centreData?.[0]?.id || "");
      if (config.farmerId) {
        setFarmer(await api.getFarmer(config.farmerId).catch(() => null));
      }
    } catch (err) {
      toast.error("Failed to load centre data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCentres();
  }, []);

  useEffect(() => {
    if (!selectedCentre) return;
    let active = true;
    api
      .getSlots(selectedCentre)
      .then((slotData) => {
        if (!active) return;
        const liveSlots = slotData.map(toUiSlot).filter(Boolean);
        setSlots(liveSlots);
        setSelectedSlot(liveSlots?.[0]?.id || "");
      })
      .catch(() => toast.error("Failed to load slots"));
    return () => {
      active = false;
    };
  }, [selectedCentre]);

  useEffect(() => {
    const bookingId = booking?.booking?.id;
    const tokenId = booking?.token?.id;
    if (!bookingId || !tokenId) return;
    Promise.allSettled([
      api.getQueueEntry(tokenId),
      api.getProcurement(bookingId),
    ]).then(([qRes, pRes]) => {
      if (qRes.status === "fulfilled") setQueueEntry(qRes.value);
      if (pRes.status === "fulfilled") {
        const record = Array.isArray(pRes.value) ? pRes.value[0] : pRes.value;
        setProcurement(record || null);
        if (record?.id)
          api
            .getPayment(record.id)
            .then((d) => setPayment(Array.isArray(d) ? d[0] : d))
            .catch(() => {});
      }
    });
  }, [booking?.booking?.id, booking?.token?.id]);

  async function createBooking() {
    if (!selectedSlot || !selectedCentre || !config.farmerId || !selectedCrop)
      return;
    setSaving(true);
    try {
      const result = await api.createBooking({
        farmer_id: config.farmerId,
        centre_id: selectedCentre,
        slot_id: selectedSlot,
        crop_id: selectedCrop,
        estimated_quantity: Number(quantity),
      });
      setBooking(result);
      localStorage.setItem("krishak-mitra-booking", JSON.stringify(result));
      toast.success("Slot booked successfully!");
      setTab("status");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-body pb-16 sm:pb-20">
      <Header
        language={language}
        onLanguageChange={onLanguageChange}
        onLogout={onLogout}
        centreName={centres[0]?.name}
        t={t}
      />

      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-8 overflow-hidden rounded-b-4xl bg-forest">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-50 sm:opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1592982537447-6f296d19b788?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 z-0 bg-linear-to-r from-forest via-forest/95 to-forest/20" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <Badge
              tone="soft"
              className="mb-4 sm:mb-6 shadow-md text-xs sm:text-sm"
            >
              <span className="animate-pulse h-2 w-2 sm:h-2.5 sm:w-2.5 bg-brand rounded-full mr-2"></span>
              {t.liveToday}
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
              {booking?.token?.token_number
                ? "Your Harvest is Ready for Procurement"
                : "The Next Generation of Farming is Here"}
            </h1>
            <p className="text-slate-200 text-base sm:text-lg max-w-xl mb-6 sm:mb-8 leading-relaxed font-medium">
              {booking?.token?.token_number
                ? `${t.keepPhone} ${centres[0]?.name || ""}. Track your live queue status below.`
                : "Transform your fields with advanced procurement solutions. From real-time crop monitoring to automated slot booking."}
            </p>
            <button
              onClick={() => setTab(booking ? "queue" : "book")}
              className="bg-brand hover:bg-brand-hover text-white rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-base sm:text-lg transition-all hover:scale-105 shadow-xl flex items-center gap-2"
            >
              {booking ? t.viewQueue : t.bookSlot}{" "}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden md:flex justify-center lg:justify-end">
            {booking?.token?.token_number ? (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm w-full">
                <h3 className="text-forest font-bold mb-3 uppercase tracking-widest text-xs sm:text-sm">
                  Digital Token
                </h3>
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-inner mb-4 inline-block border border-slate-200">
                  <QRCode
                    value={JSON.stringify({
                      token: booking.token.token_number,
                      centreId: centres[0]?.id,
                    })}
                    size={150}
                  />
                </div>
                <strong className="block font-display text-3xl sm:text-4xl text-forest">
                  {booking.token.token_number}
                </strong>
                <p className="text-slate-500 text-sm sm:text-base font-bold mt-2">
                  Present at weighbridge
                </p>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand/20 rounded-2xl flex items-center justify-center text-brand shrink-0">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-forest">
                      Smart Procurement
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500">
                      Monitor slots in real-time
                    </p>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-5">
                  <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-brand w-3/4"></div>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-amber-400 w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8 relative z-20">
        <nav className="flex justify-center mb-8 sm:mb-12 overflow-x-auto py-2">
          <div className="bg-white p-1.5 sm:p-2 rounded-2xl shadow-lg border border-slate-200 inline-flex max-w-full">
            {navItems(t).map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold transition-all whitespace-nowrap ${tab === id ? "bg-forest text-white shadow-md" : "text-slate-500 hover:text-forest hover:bg-slate-50"}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />{" "}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tab === "home" && (
              <Home
                t={t}
                booking={booking}
                queueEntry={queueEntry}
                procurement={procurement}
                payment={payment}
                crop={crops.find((c) => c.id === selectedCrop)}
                onBook={() => setTab("book")}
              />
            )}
            {tab === "book" && (
              <BookingForm
                t={t}
                centres={centres}
                selectedCentre={selectedCentre}
                setSelectedCentre={setSelectedCentre}
                crops={crops}
                selectedCrop={selectedCrop}
                setSelectedCrop={setSelectedCrop}
                slots={slots}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                quantity={quantity}
                setQuantity={setQuantity}
                saving={saving}
                booking={booking}
                onBook={createBooking}
              />
            )}
            {tab === "queue" && (
              <Queue
                t={t}
                booking={booking}
                queueEntry={queueEntry}
                centre={centres[0]}
              />
            )}
            {tab === "status" && (
              <Status
                t={t}
                booking={booking}
                procurement={procurement}
                payment={payment}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, highlight }) {
  return (
    <Panel className="relative overflow-hidden group border border-slate-200">
      {highlight && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand" />
      )}
      <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase mb-3 sm:mb-4">
        {label}
      </p>
      <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-1.5 sm:mb-2 truncate">
        {value}
      </h3>
      <p className="text-sm sm:text-base font-medium text-slate-600">
        {detail}
      </p>
    </Panel>
  );
}

function Home({ t, booking, queueEntry, procurement, payment, crop, onBook }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
          {t.overview}
        </h2>
        {!booking && (
          <button
            onClick={onBook}
            className="text-brand text-base sm:text-lg font-bold flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            {t.newSlot} <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <Metric
          highlight
          label={t.estimatedArrival}
          value={queueEntry?.estimated_turn || "--"}
          detail={
            queueEntry
              ? `Position ${queueEntry.queue_position}`
              : "Calculated from live queue"
          }
        />
        <Metric
          label={t.cropQuantity}
          value={booking ? crop?.name || "Booked" : "--"}
          detail={
            booking
              ? `${booking.booking.estimated_quantity} ${t.quintals}`
              : "No booking yet"
          }
        />
        <Metric
          label={t.paymentStatus}
          value={booking ? payment?.payment_status || t.pending : "Not started"}
          detail={
            booking
              ? procurement?.procurement_status || t.updatedAfter
              : "Book a slot to track payment"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-4">
        <Panel className="bg-forest text-white shadow-xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            {t.procurementJourney}
          </h2>
          {booking ? (
            <div className="space-y-6 sm:space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-white/10">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand shadow-lg shrink-0 text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20 ml-5 md:ml-0">
                  <h4 className="font-bold text-base sm:text-lg">
                    {t.bookingConfirmed}
                  </h4>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                Choose a crop, quantity, and available time to receive your
                mandi token.
              </p>
              <button
                onClick={onBook}
                className="bg-white text-forest rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold hover:bg-slate-100 transition-colors shadow-md"
              >
                Start Booking →
              </button>
            </div>
          )}
        </Panel>
        <Panel>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest mb-4 sm:mb-6">
            {t.recentUpdates}
          </h2>
          <div className="flex h-40 sm:h-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <p className="text-base sm:text-lg font-bold text-slate-400">
              No recent updates.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function BookingForm({
  t,
  centres,
  selectedCentre,
  setSelectedCentre,
  crops,
  selectedCrop,
  setSelectedCrop,
  slots,
  selectedSlot,
  setSelectedSlot,
  quantity,
  setQuantity,
  saving,
  booking,
  onBook,
}) {
  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_.6fr]">
      <Panel className="p-6 sm:p-10">
        <p className="text-xs sm:text-sm font-bold tracking-widest text-brand uppercase mb-2 sm:mb-3">
          {t.bookStep}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-forest mb-3 sm:mb-4">
          {t.bookTitle}
        </h2>
        <p className="text-slate-500 text-base sm:text-lg mb-8 sm:mb-10">
          {t.bookIntro}
        </p>

        <div className="space-y-6 sm:space-y-8">
          <label className="block">
            <span className="text-sm sm:text-base font-bold text-forest mb-2 sm:mb-3 block">
              {t.centre}
            </span>
            <select
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:p-4 text-sm sm:text-base font-bold text-forest shadow-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all appearance-none cursor-pointer"
            >
              {centres.length === 0 && (
                <option value="">No active centres found</option>
              )}
              {centres.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <label className="block">
              <span className="text-sm sm:text-base font-bold text-forest mb-2 sm:mb-3 block">
                {t.crop}
              </span>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:p-4 text-sm sm:text-base font-bold text-forest shadow-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all appearance-none cursor-pointer"
              >
                {crops.length === 0 && (
                  <option value="">No active crops</option>
                )}
                {crops.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm sm:text-base font-bold text-forest mb-2 sm:mb-3 block">
                {t.quantity}
              </span>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:p-4 text-sm sm:text-base font-bold text-forest shadow-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
              />
            </label>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-forest mb-4 sm:mb-6">
              {t.availableSlots}
            </h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {slots.length === 0 && (
                <p className="text-sm sm:text-base font-bold text-slate-400">
                  No slots available.
                </p>
              )}
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`flex flex-col rounded-2xl border-2 p-4 sm:p-5 text-left transition-all ${selectedSlot === slot.id ? "border-brand bg-green-50 shadow-md" : "border-slate-200 bg-white hover:border-brand/50 hover:shadow-sm"}`}
                >
                  <strong className="text-base sm:text-lg text-forest mb-1">
                    {slot.date}
                  </strong>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 mb-2 sm:mb-3">
                    {slot.time}
                  </span>
                  <Badge tone={slot.tone}>{slot.remaining} q left</Badge>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={
              saving || !selectedCentre || !selectedSlot || !selectedCrop
            }
            onClick={onBook}
            className="mt-6 sm:mt-8 w-full rounded-xl bg-brand py-4 sm:py-5 text-base sm:text-lg font-bold text-white transition-all hover:bg-brand-hover shadow-lg disabled:opacity-50"
          >
            {saving
              ? "Processing..."
              : booking
                ? t.bookedSuccess
                : "Confirm Booking"}
          </button>
        </div>
      </Panel>

      <div className="rounded-2xl sm:rounded-3xl bg-forest text-white p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Leaf size={140} />
        </div>
        <strong className="font-display text-5xl sm:text-6xl text-brand mb-6 sm:mb-8">
          02
        </strong>
        <h3 className="font-display text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          {t.bookingHelpTitle}
        </h3>
        <p className="text-white/80 text-base sm:text-lg leading-relaxed font-medium">
          {t.bookingHelp}
        </p>
      </div>
    </div>
  );
}

function Queue({ t, booking, queueEntry, centre }) {
  return (
    <Panel className="max-w-3xl mx-auto text-center py-12 sm:py-20 px-4">
      <ListOrdered className="w-16 h-16 sm:w-20 sm:h-20 text-brand mx-auto mb-6 sm:mb-8" />
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-forest mb-3 sm:mb-4">
        {t.liveQueue}
      </h2>
      <p className="text-base sm:text-lg font-bold text-slate-500 mb-8 sm:mb-10">
        {centre?.name}
      </p>

      {booking?.token ? (
        <div className="inline-block bg-slate-50 border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm w-full max-w-md">
          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">
            {t.yourToken}
          </p>
          <strong className="font-display text-4xl sm:text-5xl text-forest block mb-6 sm:mb-8">
            {booking.token.token_number}
          </strong>
          {queueEntry && (
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
              <Badge tone="soft">
                <span className="text-xs sm:text-sm">
                  Position: {queueEntry.queue_position}
                </span>
              </Badge>
              <Badge tone="live">
                <span className="text-xs sm:text-sm">{queueEntry.status}</span>
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <p className="text-lg sm:text-xl font-bold text-slate-400">
          Create a booking to view your queue entry.
        </p>
      )}
    </Panel>
  );
}

function Status({ t, booking, procurement, payment }) {
  return (
    <Panel className="max-w-3xl mx-auto py-12 sm:py-16 px-4">
      <div className="text-center mb-8 sm:mb-12">
        <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-brand mx-auto mb-6 sm:mb-8" />
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-forest">
          {t.statusTitle}
        </h2>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm">
          <span className="text-base sm:text-lg font-bold text-forest">
            Procurement Status
          </span>
          <Badge tone={procurement ? "live" : "neutral"}>
            <span className="text-xs sm:text-sm">
              {procurement?.procurement_status || "PENDING"}
            </span>
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-sm">
          <span className="text-base sm:text-lg font-bold text-forest">
            Payment Status
          </span>
          <Badge tone={payment ? "live" : "neutral"}>
            <span className="text-xs sm:text-sm">
              {payment?.payment_status || "PENDING"}
            </span>
          </Badge>
        </div>
      </div>
    </Panel>
  );
}