import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { LayoutDashboard, MapPin, CalendarDays, QrCode, ListOrdered, ShoppingCart, CreditCard, Bell, ChevronRight, Activity, Clock, ArrowRight, Gavel } from "lucide-react";
import { api, config, toUiSlot } from "../services/api";
import { Badge, Card, Button, Input, Select, SidebarLayout, CircularProgress, ProgressTimeline } from "../components/ui";
import AuctionCard from "../components/AuctionCard";
import { createAuctionDirectly, getFarmerAuctions, getFarmerBidNotifications } from "../services/biddingService";

export default function FarmerPage({ language, onLanguageChange, onLogout, farmerId }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
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
  const [bidNotifications, setBidNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [auctionTab, setAuctionTab] = useState("listings");
  const [auctions, setAuctions] = useState([]);
  const [auctionQuantity, setAuctionQuantity] = useState(1);
  const [auctionBasePrice, setAuctionBasePrice] = useState("");
  const [auctionSaving, setAuctionSaving] = useState(false);
  const [auctionGrade, setAuctionGrade] = useState("A");
  const [useManualCrop, setUseManualCrop] = useState(false);
  const [manualCropName, setManualCropName] = useState("");

  useEffect(() => {
    async function loadCentres() {
      try {
        const [centreData, cropData] = await Promise.all([
          api.getCentres(),
          api.getCrops(),
        ]);
        setCentres(centreData);
        setCrops(cropData);
        setSelectedCrop((current) => current || booking?.booking?.crop_id || cropData?.[0]?.id || "");
        setSelectedCentre((current) => current || centreData?.[0]?.id || "");
        if (farmerId || config.farmerId) {
          setFarmer(await api.getFarmer(farmerId || config.farmerId).catch(() => null));
        }
      } catch (err) {
        toast.error("Failed to load centre data");
      }
    }
    loadCentres();
  }, []);

  useEffect(() => {
    if (!selectedCentre) return;
    let active = true;
    api.getSlots(selectedCentre).then((slotData) => {
      if (!active) return;
      const liveSlots = slotData.map(toUiSlot).filter(Boolean);
      setSlots(liveSlots);
      setSelectedSlot(liveSlots?.[0]?.id || "");
    }).catch(() => toast.error("Failed to load slots"));
    return () => { active = false; };
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
          api.getPayment(record.id).then((d) => setPayment(Array.isArray(d) ? d[0] : d)).catch(() => {});
      }
    });
  }, [booking?.booking?.id, booking?.token?.id]);

  useEffect(() => {
    if (!farmerId) return;
    getFarmerBidNotifications(farmerId).then((notifications) => setNotificationCount(notifications.length)).catch(() => {});
  }, [farmerId]);

  useEffect(() => {
    if (activeTab !== "bidding" || !farmerId) return;
    getFarmerAuctions(farmerId).then(setAuctions).catch((error) => toast.error(error?.message || "Unable to load your listings."));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "notifications") return;
    let active = true;
    getFarmerBidNotifications(farmerId).then((notifications) => {
      if (active) {
        setBidNotifications(notifications);
        setNotificationCount(notifications.length);
      }
    });
    return () => { active = false; };
  }, [activeTab, farmerId]);

  async function createBooking() {
    if (!selectedSlot || !selectedCentre || !(farmerId || config.farmerId) || !selectedCrop) return;
    try {
      const result = await api.createBooking({
        farmer_id: farmerId || config.farmerId,
        centre_id: selectedCentre,
        slot_id: selectedSlot,
        crop_id: selectedCrop,
        estimated_quantity: Number(quantity),
      });
      setBooking(result);
      localStorage.setItem("krishak-mitra-booking", JSON.stringify(result));
      toast.success("Slot booked successfully!");
      setActiveTab("token");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function createAuction(event) {
    event.preventDefault();
    setAuctionSaving(true);
    try {
      const selectedCropRecord = crops.find((crop) => crop?.id === selectedCrop);
      const cropNameToUse = useManualCrop ? manualCropName : selectedCropRecord?.name;
      const listing = await createAuctionDirectly({ farmerId, cropId: selectedCrop, cropName: cropNameToUse, quantity: auctionQuantity, basePrice: auctionBasePrice, grade: auctionGrade });
      setAuctions((current) => [listing, ...current]);
      setAuctionBasePrice("");
      setAuctionGrade("A");
      setManualCropName("");
      setUseManualCrop(false);
      toast.success("Private market listing created.");
      setAuctionTab("listings");
    } catch (error) {
      toast.error(error?.message || "Unable to create listing.");
    } finally {
      setAuctionSaving(false);
    }
  }

  const navItems = [
    { id: "dashboard", label: t("overview"), icon: LayoutDashboard },
    { id: "centres", label: t("centre"), icon: MapPin },
    { id: "bookings", label: t("bookSlot"), icon: CalendarDays },
    { id: "token", label: t("yourToken"), icon: QrCode },
    { id: "queue", label: t("liveQueue"), icon: ListOrdered },
    { id: "procurement", label: t("procurementJourney"), icon: ShoppingCart },
    { id: "payment", label: t("paymentStatus"), icon: CreditCard },
    { id: "notifications", label: notificationCount ? `Updates (${notificationCount})` : t("recentUpdates"), icon: Bell },
    { id: "bidding", label: "Private Market Bidding", icon: Gavel },
  ];

  const journeySteps = [
    { title: "Booking", subtitle: booking?.booking?.date || "Pending" },
    { title: "Arrival", subtitle: queueEntry ? "Completed" : "Pending" },
    { title: "Quality & Weight", subtitle: procurement ? procurement.procurement_status : "Pending" },
    { title: "Acceptance", subtitle: procurement?.procurement_status === "ACCEPTED" ? "Completed" : "Pending" },
    { title: "Payment", subtitle: payment ? payment.payment_status : "Pending" },
  ];

  let currentStep = -1;
  if (booking) currentStep = 0;
  if (queueEntry && queueEntry.status !== "waiting") currentStep = 1;
  if (procurement) currentStep = 2;
  if (procurement?.procurement_status === "ACCEPTED") currentStep = 3;
  if (payment) currentStep = 4;

  const activeCrop = crops.find((c) => c.id === (booking?.booking?.crop_id || selectedCrop));

  return (
    <SidebarLayout
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      language={language}
      onLanguageChange={onLanguageChange}
    >
      {/* ── DASHBOARD ── */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-forest">{t("greetingFarmer")} Ramesh Kumar</h1>
              <p className="text-muted text-sm mt-1">{t("journeyIntro")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveTab("bookings")} className="text-left rounded-2xl border border-line bg-surface p-4 hover:border-brand/40 hover:shadow-sm transition-all">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">APMC workflow</p>
                <p className="font-bold text-forest mt-1">Book a mandi slot</p>
                <p className="text-xs text-muted mt-1">Choose a centre, time, and quantity.</p>
              </button>
              <button onClick={() => setActiveTab("bidding")} className="text-left rounded-2xl border border-brand/30 bg-green-50/70 p-4 hover:border-brand hover:shadow-sm transition-all">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">Private market</p>
                <p className="font-bold text-forest mt-1">Sell to direct buyers</p>
                <p className="text-xs text-muted mt-1">Post your crop and receive competing bids.</p>
              </button>
            </div>

            <div className="bg-surface border border-line rounded-3xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
              <div className="flex-1">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">{t("bookingConfirmed")}</h3>
                {booking ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-line">
                        {booking?.token?.token_number && <QRCode value={booking.token.token_number} size={64} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-muted">{t("yourToken")} <span className="text-forest font-extrabold text-xl">#{booking?.token?.token_number || "N/A"}</span></p>
                        <p className="text-sm font-medium text-forest">{activeCrop?.name} &bull; {booking?.booking?.estimated_quantity || 0} q</p>
                      </div>
                    </div>
                    <div className="space-y-3 border-t border-line pt-4">
                      <div className="flex items-center gap-3 text-sm text-forest font-medium">
                        <MapPin className="w-4 h-4 text-brand" /> {centres.find((c) => c.id === booking?.booking?.centre_id)?.name || "Unknown Centre"}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-forest font-medium">
                        <Clock className="w-4 h-4 text-brand" /> {booking?.booking?.date || "TBD"}
                      </div>
                    </div>
                    <Button className="w-full mt-6 gap-2" onClick={() => setActiveTab("token")}>{t("yourToken")} <ChevronRight className="w-4 h-4" /></Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted font-medium mb-4">{t("nextStep")}</p>
                    <Button onClick={() => setActiveTab("bookings")}>{t("bookSlot")}</Button>
                  </div>
                )}
              </div>

              <div className="flex-1 border-t sm:border-t-0 sm:border-l border-line pt-6 sm:pt-0 sm:pl-6 flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 self-start">{t("capacityUsed")}</h3>
                <Badge tone="success" className="mb-4 self-start"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" /> {t("open")}</Badge>
                <div className="flex items-center justify-between w-full mt-2">
                  <div className="text-center">
                    <p className="text-xs text-muted font-bold">{t("liveQueue")}</p>
                    <p className="text-sm font-bold text-forest">12 {t("farmerRole").replace(/[^a-zA-Zऀ-ॿఀ-౿଀-୿઀-૿ಀ-೿ഀ-ൿ਀-੿஀-௿؀-ۿ଀-୿]/g, "")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted font-bold">{t("estimatedArrival")}</p>
                    <p className="text-sm font-bold text-forest">35-45 min</p>
                  </div>
                  <CircularProgress value={81} label="Capacity" />
                </div>
              </div>
            </div>

            <Card>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">{t("procurementJourney")}</h3>
              <ProgressTimeline steps={journeySteps} currentStep={currentStep} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest">{t("centre")}</h3>
                <span className="text-xs text-brand font-bold">2.4 km</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <MapPin className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="font-bold text-forest text-sm">Mangalagiri Procurement Centre</p>
                  <p className="text-xs text-muted font-medium mt-1">{t("open")}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" onClick={() => setActiveTab("centres")}>{t("centre")} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-forest text-white border-transparent">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">{t("liveQueue")}</h3>
              {queueEntry ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-medium text-white/70">{t("myStatus")}</p>
                      <p className="font-display text-4xl font-extrabold">#{queueEntry.queue_position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white/70">{t("estimatedArrival")}</p>
                      <p className="font-display text-2xl font-bold">~{queueEntry.estimated_wait_time} min</p>
                    </div>
                  </div>
                  <Button className="w-full bg-white text-forest hover:bg-slate-100" onClick={() => setActiveTab("queue")}>{t("viewQueue")} <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </>
              ) : (
                <p className="text-sm font-medium text-white/70 py-4">{t("nextStep")}</p>
              )}
            </Card>

            <Card>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">{t("recentUpdates")}</h3>
              {booking ? (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-brand shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-forest">{t("bookedSuccess")}</p>
                    <p className="text-xs text-muted font-medium mt-0.5">{booking?.booking?.date || "TBD"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted font-medium">{t("nextStep")}</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── CENTRES ── */}
      {activeTab === "centres" && (
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">{t("centre")}</h1>
          {centres.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="font-bold text-forest">{c.name}</p>
                  <p className="text-xs text-muted font-medium mt-1">{c.district} &bull; Capacity: {c.daily_capacity} q/day</p>
                </div>
              </div>
              <Badge tone="success">{t("open")}</Badge>
            </Card>
          ))}
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {activeTab === "bookings" && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-line bg-slate-50/50 flex items-center gap-4 overflow-x-auto">
              {["Centre", "Date", "Slot", "Quantity", "Confirm"].map((step, idx) => (
                <div key={idx} className={`flex items-center gap-2 whitespace-nowrap text-sm font-bold ${idx === 2 ? "text-brand" : "text-muted"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${idx === 2 ? "bg-brand" : "bg-slate-300"}`}>{idx + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <div className="p-8 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-forest mb-2">Choose a Time Slot</h2>
                <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                  <MapPin className="w-5 h-5 text-brand" />
                  <div>
                    <p className="font-bold text-forest text-sm">Mangalagiri Procurement Centre</p>
                    <p className="text-xs text-brand font-medium">Operating normally</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-forest mb-4">{t("crop")}</label>
                <Select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                  {crops.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-bold text-forest mb-4">{t("quantity")}</label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-forest mb-4">{t("availableSlots")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slots.map((slot) => {
                    const isAvailable = slot.tone === "green";
                    return (
                      <button key={slot.id} onClick={() => isAvailable && setSelectedSlot(slot.id)} disabled={!isAvailable}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                          selectedSlot === slot.id ? "border-brand bg-green-50 ring-2 ring-brand/10"
                            : isAvailable ? "border-line bg-surface hover:border-brand/30" : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                        }`}>
                        <div>
                          <p className="font-bold text-forest text-sm">{slot.time}</p>
                          <p className="text-xs text-muted font-medium mt-1">{slot.remaining} q available</p>
                        </div>
                        <Badge tone={isAvailable ? "success" : "default"}>{isAvailable ? "Available" : "Full"}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-line">
                <Button variant="ghost" onClick={() => setActiveTab("dashboard")}>{t("overview")}</Button>
                <Button onClick={createBooking} disabled={!selectedSlot || !selectedCrop}>{t("confirmBooking")} <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TOKEN ── */}
      {activeTab === "token" && (
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Your Digital Token</h1>
          <Card className="flex flex-col items-center gap-6 text-center">
            {booking?.token?.token_number ? (
              <>
                <div className="p-6 bg-white rounded-2xl border border-line shadow-sm">
                  <QRCode value={booking.token.token_number} size={180} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Token Number</p>
                  <p className="font-display text-4xl font-extrabold text-forest">#{booking.token.token_number}</p>
                </div>
                <p className="text-sm text-muted">Show this QR code at the procurement centre gate</p>
                <Badge tone="success" className="text-sm px-4 py-2">Valid for {booking?.booking?.date || "TBD"}</Badge>
              </>
            ) : (
              <>
                <p className="text-muted font-medium py-8">No token yet. Book a slot first.</p>
                <Button onClick={() => setActiveTab("bookings")}>Book a Slot</Button>
              </>
            )}
          </Card>
        </div>
      )}

      {/* ── QUEUE ── */}
      {activeTab === "queue" && (
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Live Queue Status</h1>
          {queueEntry ? (
            <Card className="bg-forest text-white border-transparent text-center">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Your Position</p>
              <p className="font-display text-7xl font-extrabold mb-4">#{queueEntry.queue_position}</p>
              <p className="text-white/70 font-medium text-lg">Estimated wait: ~{queueEntry.estimated_wait_time} minutes</p>
              <p className="text-white/40 text-sm mt-4">Currently serving: #08</p>
            </Card>
          ) : (
            <Card className="text-center py-10">
              <p className="text-muted font-medium mb-4">You are not in the queue yet.</p>
              <Button onClick={() => setActiveTab("bookings")}>Book a Slot</Button>
            </Card>
          )}
        </div>
      )}

      {/* ── PROCUREMENT ── */}
      {activeTab === "procurement" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Procurement Details</h1>
          {procurement ? (
            <Card>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted">Status</span>
                  <Badge tone="warning">{procurement.procurement_status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted">Actual Quantity</span>
                  <span className="text-sm font-bold text-forest">{procurement.actual_quantity} q</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted">Quality Grade</span>
                  <span className="text-sm font-bold text-forest">{procurement.quality_grade}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-10">
              <p className="text-muted font-medium">No procurement record yet.</p>
            </Card>
          )}
        </div>
      )}

      {/* ── PAYMENT ── */}
      {activeTab === "payment" && (
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Payment Status</h1>
          {payment ? (
            <Card>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted">Amount</span>
                  <span className="text-lg font-extrabold text-forest">&#8377;{payment.amount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted">Status</span>
                  <Badge tone="warning">{payment.payment_status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted">Ref</span>
                  <span className="text-sm font-mono text-muted">{payment.transaction_ref}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-10">
              <p className="text-muted font-medium">Payment details will appear after procurement is accepted.</p>
            </Card>
          )}
        </div>
      )}

      {/* -- PRIVATE MARKET BIDDING -- */}
      {activeTab === "bidding" && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">Private market</p>
            <h1 className="font-display text-2xl font-bold text-forest">Sell directly to buyers</h1>
            <p className="text-sm text-muted mt-1">Create a listing alongside your existing APMC mandi bookings.</p>
          </div>
          <div className="flex gap-2 border-b border-line">
            <button className={`px-4 py-3 text-sm font-bold border-b-2 ${auctionTab === "listings" ? "border-brand text-brand" : "border-transparent text-muted"}`} onClick={() => setAuctionTab("listings")}>My listings</button>
            <button className={`px-4 py-3 text-sm font-bold border-b-2 ${auctionTab === "create" ? "border-brand text-brand" : "border-transparent text-muted"}`} onClick={() => setAuctionTab("create")}>Post a crop</button>
          </div>
          {auctionTab === "create" ? (
            <Card className="max-w-2xl">
              <h2 className="font-display text-xl font-bold text-forest mb-6">New private listing</h2>
              <form onSubmit={createAuction} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Crop</label>
                  {!useManualCrop ? (
                    <div className="space-y-3">
                      <Select value={selectedCrop} onChange={(event) => setSelectedCrop(event.target.value)} required>
                        {crops.map((crop) => <option key={crop?.id} value={crop?.id}>{crop?.name || "Unnamed crop"}</option>)}
                      </Select>
                      <button
                        type="button"
                        onClick={() => setUseManualCrop(true)}
                        className="text-sm text-brand font-bold hover:underline"
                      >
                        + Add custom crop name
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={manualCropName}
                        onChange={(event) => setManualCropName(event.target.value)}
                        placeholder="Enter crop name"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => { setUseManualCrop(false); setManualCropName(""); }}
                        className="text-sm text-brand font-bold hover:underline"
                      >
                        ← Select from list
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Quality Grade</label>
                  <Select value={auctionGrade} onChange={(event) => setAuctionGrade(event.target.value)} required>
                    <option value="A">Grade A (Excellent)</option>
                    <option value="B">Grade B (Good)</option>
                    <option value="C">Grade C (Average)</option>
                    <option value="D">Grade D (Fair)</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Quantity (quintals)</label>
                  <Input type="number" min="0.01" step="0.01" value={auctionQuantity} onChange={(event) => setAuctionQuantity(event.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Base price per quintal</label>
                  <Input type="number" min="0.01" step="0.01" value={auctionBasePrice} onChange={(event) => setAuctionBasePrice(event.target.value)} placeholder="Enter minimum acceptable price" required />
                </div>
                <Button type="submit" disabled={auctionSaving || !selectedCrop || (useManualCrop && !manualCropName)}>{auctionSaving ? "Publishing..." : "Publish private listing"}</Button>
              </form>
            </Card>
          ) : (
            auctions.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{auctions.map((auction) => <AuctionCard key={auction?.id} auction={auction} role="farmer" onUpdated={(auctionId) => setAuctions((current) => current.map((item) => item?.id === auctionId ? { ...item, status: "awarded" } : item))} onRemoved={(auctionId) => setAuctions((current) => current.filter((item) => item?.id !== auctionId))} />)}</div> : <Card className="text-center py-10"><p className="text-muted font-medium">You have no private market listings yet.</p><Button className="mt-4" onClick={() => setAuctionTab("create")}>Post your first crop</Button></Card>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Notifications</h1>
          <Card>
            {bidNotifications.length > 0 ? (
              <div className="space-y-4 mb-4">
                {bidNotifications.map((notification) => (
                  <div key={notification?.id} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
                    <div><p className="text-sm font-bold text-forest">{notification?.title || "New bid"}</p><p className="text-xs text-muted mt-0.5">{notification?.message}</p></div>
                  </div>
                ))}
              </div>
            ) : booking ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-brand shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-forest">Slot Booked Successfully</p>
                    <p className="text-xs text-muted mt-0.5">Your slot at Mangalagiri Centre on {booking?.booking?.date} is confirmed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-forest">Centre Update</p>
                    <p className="text-xs text-muted mt-0.5">The centre is operating normally. Expected wait time: 35-45 min.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted font-medium text-center py-8">No notifications yet.</p>
            )}
          </Card>
        </div>
      )}
    </SidebarLayout>
  );
}