import { useEffect, useState } from "react";
import { api, config, isUuid, toUiSlot } from "../services/api";
import { Badge, Header, Icon, Panel } from "../components/ui";

const navItems = (t) => [
  ["home", "⌂", t.overview],
  ["book", "+", t.bookSlot],
  ["queue", "≡", t.liveQueue],
  ["status", "✓", t.myStatus],
];

export default function FarmerPage({ language, onLanguageChange, onAdmin, t }) {
  const [tab, setTab] = useState("home");
  const [centres, setCentres] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [quantity, setQuantity] = useState(40);
  const [booking, setBooking] = useState(() =>
    JSON.parse(localStorage.getItem("krishak-mitra-booking") || "null"),
  );
  const [queueEntry, setQueueEntry] = useState(null);
  const [procurement, setProcurement] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCentres() {
    setLoading(true);
    setError("");
    try {
      const [centreData, cropData] = await Promise.all([
        api.getCentres(),
        api.getCrops(),
      ]);
      setCentres(centreData || []);
      setCrops(cropData || []);
      setSelectedCrop(
        (current) =>
          current || booking?.booking?.crop_id || cropData?.[0]?.id || "",
      );
      setSelectedCentre((current) => current || centreData?.[0]?.id || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    loadCentres().then(() => {
      if (!active) setCentres([]);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCentre) return;
    let active = true;
    api
      .getSlots(selectedCentre)
      .then((slotData) => {
        if (!active) return;
        const liveSlots = (slotData || []).map(toUiSlot);
        setSlots(liveSlots);
        setSelectedSlot(liveSlots[0]?.id || "");
      })
      .catch((requestError) => active && setError(requestError.message));
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
    ]).then(([queueResult, procurementResult]) => {
      if (queueResult.status === "fulfilled") setQueueEntry(queueResult.value);
      if (procurementResult.status === "fulfilled") {
        const record = Array.isArray(procurementResult.value)
          ? procurementResult.value[0]
          : procurementResult.value;
        setProcurement(record || null);
        if (record?.id)
          api
            .getPayment(record.id)
            .then((data) => setPayment(Array.isArray(data) ? data[0] : data))
            .catch(() => {});
      }
    });
  }, [booking?.booking?.id, booking?.token?.id]);

  async function createBooking() {
    if (
      !selectedSlot ||
      !selectedCentre ||
      !config.farmerId ||
      !selectedCrop ||
      !isUuid(config.farmerId) ||
      !isUuid(selectedCrop)
    ) {
      setError(
        "VITE_FARMER_ID must be a real farmer UUID, and you must select a valid crop from the database.",
      );
      return;
    }
    setSaving(true);
    setError("");
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
      setTab("status");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const centre = centres[0];
  return (
    <div className="min-h-screen bg-mist">
      <Header language={language} onLanguageChange={onLanguageChange} t={t} />
      <main className="mx-auto max-w-290 px-4 py-10 sm:px-7 lg:py-16">
        <div className="flex items-start justify-between gap-5">
          <div>
            <Eyebrow>{t.farmerPortal}</Eyebrow>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[34px]">
              {t.greetingFarmer}
            </h1>
            <p className="mt-2 text-sm text-muted">{t.journeyIntro}</p>
          </div>
          <button
            onClick={onAdmin}
            className="hidden rounded-md border border-line bg-white px-4 py-3 text-xs font-semibold text-emerald-700 sm:block"
          >
            <Icon>▣</Icon>
            {t.adminView}
          </button>
        </div>
        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <Panel className="mt-8">
            <p className="text-sm text-muted">Loading live centre data...</p>
          </Panel>
        ) : (
          <>
            <Hero
              t={t}
              centre={centre}
              booking={booking}
              onQueue={() => setTab("queue")}
            />
            <nav className="my-8 flex w-full gap-1 rounded-lg bg-emerald-50 p-1 sm:w-fit">
              {navItems(t).map(([id, icon, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`rounded-md px-3 py-2.5 text-xs font-semibold sm:px-5 ${tab === id ? "bg-white text-forest shadow" : "text-muted"}`}
                >
                  <Icon>{icon}</Icon>
                  {label}
                </button>
              ))}
            </nav>
            {tab === "home" && (
              <Home
                t={t}
                booking={booking}
                queueEntry={queueEntry}
                procurement={procurement}
                payment={payment}
                crop={crops.find((item) => item.id === selectedCrop)}
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
              <Queue t={t} booking={booking} queueEntry={queueEntry} />
            )}
            {tab === "status" && (
              <Status
                t={t}
                booking={booking}
                procurement={procurement}
                payment={payment}
              />
            )}
          </>
        )}
      </main>
      <footer className="mx-auto flex max-w-290 justify-between border-t border-line px-4 py-5 text-[11px] text-slate-400 sm:px-7">
        <span>© 2024 Krishak Mitra</span>
        <span className="hidden sm:block">
          Designed for farmers, built for trust.
        </span>
      </footer>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="mb-2 text-[10px] font-bold tracking-[1.5px] text-coral">
      {children}
    </p>
  );
}
function Hero({ t, centre, booking, onQueue }) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex min-h-67.5 justify-between rounded-lg bg-forest p-7 text-white">
        <div className="max-w-[66%]">
          <Badge tone="live">● {t.liveToday}</Badge>
          <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
            {booking?.token?.token_number ? t.tokenMoving : t.bookTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-emerald-100">
            {booking?.token?.token_number
              ? `${t.keepPhone} ${centre?.name || ""}.`
              : "Choose an available slot to create your digital token."}
          </p>
          <button
            onClick={onQueue}
            className="mt-4 rounded-md bg-orange-200 px-4 py-3 text-xs font-bold text-forest"
          >
            {t.viewQueue} <span className="ml-3">→</span>
          </button>
        </div>
        {booking?.token?.token_number && (
          <div className="mt-16 hidden h-32 w-32 rotate-6 flex-col items-center justify-center rounded-full border border-dashed border-emerald-200/50 sm:flex">
            <span className="text-[9px] text-emerald-100">{t.yourToken}</span>
            <strong className="my-1 font-display text-2xl">
              {booking.token.token_number}
            </strong>
          </div>
        )}
      </div>
      <Panel className="p-7">
        <div className="flex justify-between text-xs font-bold">
          <span>
            <Icon>⌖</Icon>
            {centre?.name || "Centre unavailable"}
          </span>
          <Badge tone="soft">{centre?.is_active ? t.open : "-"}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted">Live data from FastAPI</p>
        <div className="my-10 flex items-baseline gap-2">
          <strong className="font-display text-4xl">
            {centre?.daily_capacity || "-"}
          </strong>
          <span className="text-xs text-muted">quintals capacity</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-50">
          <span className="block h-full w-[68%] rounded-full bg-coral" />
        </div>
      </Panel>
    </div>
  );
}
function Home({ t, booking, queueEntry, procurement, payment, crop, onBook }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>{t.nextStep}</Eyebrow>
          <h2 className="font-display text-2xl font-bold">{t.planVisit}</h2>
        </div>
        <button onClick={onBook} className="text-xs font-bold text-coral">
          {t.newSlot} →
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Metric
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
              ? `${booking.booking.estimated_quantity} ${t.quintals}${crop?.variety ? ` · ${crop.variety}` : ""}`
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
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-5 font-display text-xl font-bold">
            {t.procurementJourney}
          </h2>
          {booking ? (
            <>
              <p className="text-sm text-muted">{t.bookingConfirmed}</p>
              <p className="mt-3 text-sm text-muted">
                {t.checkedIn}: {queueEntry?.status || t.awaitingArrival}
              </p>
              <p className="mt-3 text-sm text-muted">
                {t.weighingQuality}:{" "}
                {procurement?.procurement_status || t.pending}
              </p>
            </>
          ) : (
            <div className="rounded-md bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-forest">
                Your journey starts here.
              </p>
              <p className="mt-1 text-xs text-muted">
                Choose a crop, quantity, and available time to receive your
                mandi token.
              </p>
              <button
                onClick={onBook}
                className="mt-3 text-xs font-bold text-coral"
              >
                Book your first slot →
              </button>
            </div>
          )}
        </Panel>
        <Panel>
          <h2 className="mb-5 font-display text-xl font-bold">
            {t.recentUpdates}
          </h2>
          <p className="text-xs text-muted">
            Live updates will appear after a booking is created.
          </p>
        </Panel>
      </div>
    </>
  );
}
function Metric({ label, value, detail }) {
  return (
    <article className="rounded-lg border border-line border-t-4 border-t-coral bg-white p-5 shadow-sm">
      <Eyebrow>{label}</Eyebrow>
      <h3 className="mt-5 font-display text-xl font-bold">{value}</h3>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </article>
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
    <section className="grid gap-4 lg:grid-cols-[1fr_.65fr]">
      <Panel className="max-w-2xl">
        <Eyebrow>{t.bookStep}</Eyebrow>
        <h2 className="font-display text-2xl font-bold">{t.bookTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{t.bookIntro}</p>
        <label className="mt-6 block text-xs font-bold">
          {t.centre}
          <select
            value={selectedCentre}
            onChange={(event) => setSelectedCentre(event.target.value)}
            className="mt-2 w-full rounded-md border border-line p-3 text-sm font-normal"
          >
            {centres.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-6 block text-xs font-bold">
          {t.crop}
          <select
            value={selectedCrop}
            onChange={(event) => setSelectedCrop(event.target.value)}
            className="mt-2 w-full rounded-md border border-line p-3 text-sm font-normal"
          >
            {crops.map((crop) => (
              <option value={crop.id} key={crop.id}>
                {crop.name}
                {crop.variety ? ` - ${crop.variety}` : ""}
                {crop.minimum_support_price
                  ? ` (MSP: Rs ${crop.minimum_support_price})`
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-6 block text-xs font-bold">
          {t.quantity}
          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="mt-2 w-full rounded-md border border-line p-3 text-sm font-normal"
            type="number"
            min="1"
          />
        </label>
        <h3 className="mt-7 font-display text-lg font-bold">
          {t.availableSlots}
        </h3>
        <div className="mt-3 grid gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`flex justify-between rounded-md border p-3 text-left text-xs ${selectedSlot === slot.id ? "border-coral bg-orange-50" : "border-line bg-slate-50"}`}
            >
              <span>
                <strong className="block">{slot.date}</strong>
                <small className="mt-1 block text-muted">{slot.time}</small>
              </span>
              <span
                className={
                  slot.tone === "amber" ? "text-amber-700" : "text-emerald-700"
                }
              >
                {slot.remaining} q left
              </span>
            </button>
          ))}
        </div>
        <button
          disabled={saving}
          onClick={onBook}
          className="mt-5 w-full rounded-md bg-coral p-3 text-xs font-bold text-white disabled:opacity-60"
        >
          {saving ? "Booking..." : booking ? t.bookedSuccess : t.continue}{" "}
          <span className="ml-3">→</span>
        </button>
      </Panel>
      <aside className="rounded-lg bg-emerald-50 p-8">
        <strong className="font-display text-4xl text-coral">02</strong>
        <h3 className="mt-8 font-display text-xl font-bold">
          {t.bookingHelpTitle}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">{t.bookingHelp}</p>
      </aside>
    </section>
  );
}
function Queue({ t, booking, queueEntry }) {
  return (
    <section>
      <Eyebrow>RAJASTHAN MANDI CENTRE</Eyebrow>
      <h2 className="font-display text-2xl font-bold">{t.liveQueue}</h2>
      <Panel className="mt-5">
        <p className="text-sm text-muted">
          {booking?.token
            ? `${t.yourToken}: ${booking.token.token_number}`
            : "Create a booking to view your queue entry."}
        </p>
        {queueEntry && (
          <p className="mt-3 text-sm text-muted">
            Position: {queueEntry.queue_position} · Status: {queueEntry.status}
          </p>
        )}
      </Panel>
    </section>
  );
}
function Status({ t, booking, procurement, payment }) {
  return (
    <section>
      <Eyebrow>{booking?.token?.token_number || "TOKEN"}</Eyebrow>
      <h2 className="font-display text-2xl font-bold">{t.statusTitle}</h2>
      <Panel className="mt-5">
        <p className="text-sm text-muted">
          {booking
            ? t.bookingConfirmed
            : "Create a booking to load procurement status."}
        </p>
        {procurement && (
          <p className="mt-3 text-sm text-muted">
            Procurement: {procurement.procurement_status || "PENDING"}
          </p>
        )}
        {payment && (
          <p className="mt-2 text-sm text-muted">
            Payment: {payment.payment_status || "PENDING"}
          </p>
        )}
      </Panel>
    </section>
  );
}
