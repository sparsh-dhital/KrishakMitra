import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { LayoutDashboard, MapPin, CalendarDays, QrCode, ListOrdered, ShoppingCart, CreditCard, Bell, ChevronRight, Activity, Clock, ArrowRight, Gavel } from "lucide-react";
import { api, config, toUiSlot, useLiveSync } from "../services/api";
import { Badge, Card, Button, Input, Select, SidebarLayout, CircularProgress, ProgressTimeline, Eyebrow } from "../components/ui";
import AuctionCard from "../components/AuctionCard";
import QRCodeModal from "../components/QRCodeModal";
import { createAuctionDirectly, getFarmerAuctions, getFarmerBidNotifications } from "../services/biddingService";

export default function FarmerPage({ language, onLanguageChange, onLogout, onHome, farmerId, farmerName }) {
  const { t } = useTranslation();
  const syncTick = useLiveSync();
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("krishak-mitra-farmer-tab") || "dashboard");
  
  useEffect(() => {
    sessionStorage.setItem("krishak-mitra-farmer-tab", activeTab);
  }, [activeTab]);
  const [bookingStep, setBookingStep] = useState(0);
  const [showNewBookingForm, setShowNewBookingForm] = useState(false);
  const [centres, setCentres] = useState([]);
  const [farmer, setFarmer] = useState(null);
  const [crops, setCrops] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [quantities, setQuantities] = useState({});
  const [notifications, setNotifications] = useState([]);

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ mobile: "", bank: "" });
  const [liveQueueStats, setLiveQueueStats] = useState({ farmers_in_queue: 0, estimated_wait_time: 0 });

  // Bidding states
  const [bidNotifications, setBidNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [auctionTab, setAuctionTab] = useState("listings");
  const [auctions, setAuctions] = useState([]);
  const [auctionQuantity, setAuctionQuantity] = useState(1);
  const [auctionBasePrice, setAuctionBasePrice] = useState("");
  const [auctionSaving, setAuctionSaving] = useState(false);
  const [auctionCrop, setAuctionCrop] = useState("");
  const [auctionGrade, setAuctionGrade] = useState("A");
  const [useManualCrop, setUseManualCrop] = useState(false);
  const [manualCropName, setManualCropName] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    async function loadCentres() {
      try {
        const [centreData, cropData, notifs] = await Promise.all([
          api.getCentres(),
          api.getCrops(),
          api.getNotifications()
        ]);
        setCentres(centreData);
        setCrops(cropData);
        setNotifications(notifs);
        
        const unread = notifs.filter(n => !n.read);
        if (unread.length > 0) {
          toast(`You have ${unread.length} new notification(s)!`, { icon: '' });
        }

        setSelectedCrops(booking?.booking?.crops ? booking.booking.crops.map(c => c.crop_id) : (cropData?.[0] ? [cropData[0].id] : []));
        if (booking?.booking?.crops) {
          const initialQuantities = {};
          booking.booking.crops.forEach(c => initialQuantities[c.crop_id] = c.quantity);
          setQuantities(initialQuantities);
        } else {
          setQuantities(cropData?.[0] ? { [cropData[0].id]: 40 } : {});
        }

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
    if (activeTab !== "notifications" || !farmerId) return;
    api.getNotifications(farmerId).then(setNotifications).catch(() => {});
    
    // Bid notifications
    let active = true;
    getFarmerBidNotifications(farmerId).then((notifications) => {
      if (active) setBidNotifications(notifications);
    });
    return () => { active = false; };
  }, [activeTab, farmerId]);

  useEffect(() => {
    if (activeTab !== "bidding" || !farmerId) return;
    getFarmerAuctions(farmerId).then(setAuctions).catch((error) => toast.error(error?.message || "Unable to load your listings."));
  }, [activeTab, farmerId]);

  useEffect(() => {
    if (!selectedCentre) return;
    let active = true;
    api.getSlots(selectedCentre).then((slotData) => {
      if (!active) return;
      const liveSlots = slotData.map(toUiSlot).filter(Boolean);
      setSlots(liveSlots);
      setSelectedSlot(liveSlots?.[0]?.id || "");
    }).catch(() => toast.error("Failed to load slots"));

    api.getLiveQueueStats(selectedCentre).then((stats) => {
      if (!active) return;
      setLiveQueueStats(stats);
    });

    return () => { active = false; };
  }, [selectedCentre, syncTick]);

  useEffect(() => {
    const bookingId = booking?.booking?.id;
    const tokenId = booking?.token?.id;
    if (!bookingId || !tokenId) return;
    Promise.allSettled([
      api.getQueueEntry(tokenId),
      api.getProcurement(bookingId),
      api.getBooking(bookingId),
    ]).then(([qRes, pRes, bRes]) => {
      if (qRes.status === "fulfilled") setQueueEntry(qRes.value);
      if (pRes.status === "fulfilled") {
        const record = Array.isArray(pRes.value) ? pRes.value[0] : pRes.value;
        setProcurement(record || null);
        if (record?.id)
          api.getPayment(record.id, bookingId).then((d) => setPayment(Array.isArray(d) ? d[0] : d)).catch(() => {});
      }
      if (bRes.status === "fulfilled" && bRes.value) {
        setBooking(prev => ({ ...prev, booking: { ...prev.booking, ...bRes.value } }));
      }
    });
  }, [booking?.booking?.id, booking?.token?.id, syncTick]);

  useEffect(() => {
    if (!farmerId) return;
    getFarmerBidNotifications(farmerId).then((notifications) => setNotificationCount(notifications.length)).catch(() => {});
  }, [farmerId]);

  async function createBooking() {
    if (!selectedSlot || !selectedCentre || !farmerId || selectedCrops.length === 0) return;
    try {
      const payloadCrops = selectedCrops.map(cropId => ({
        crop_id: cropId,
        crop_name: crops.find(c => c.id === cropId)?.name || "Unknown",
        quantity: Number(quantities[cropId]) || 0
      }));

      const result = await api.createBooking({
        farmer_id: farmerId || config.farmerId,
        farmer_name: farmerName || "Ramesh Kumar",
        centre_id: selectedCentre,
        slot_id: selectedSlot,
        crops: payloadCrops
      });
      setBooking(result);
      localStorage.setItem("krishak-mitra-booking", JSON.stringify(result));
      toast.success("Slot booked successfully!");
      setShowNewBookingForm(false);
      setActiveTab("token");
    } catch (err) {
      toast.error(err.message);
      setBooking(null);
    }
  }

  useEffect(() => {
    if (showPaymentModal && farmer) {
      setPaymentForm({
        mobile: booking?.booking?.farmer_mobile || farmer.mobile_number || "",
        bank: booking?.booking?.farmer_bank || farmer.bank_account || ""
      });
    }
  }, [showPaymentModal, farmer, booking]);

  const handleRequestPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.mobile || !paymentForm.bank) {
      toast.error("Please provide valid contact and bank details");
      return;
    }
    try {
      const result = await api.requestPayment(booking.booking.id, paymentForm.mobile, paymentForm.bank);
      const newBooking = { ...booking, booking: { ...booking.booking, status: "PAYMENT_REQUESTED", farmer_mobile: paymentForm.mobile, farmer_bank: paymentForm.bank } };
      setBooking(newBooking);
      localStorage.setItem("krishak-mitra-booking", JSON.stringify(newBooking));
      
      const allB = await api.getAllBookings();
      const bIdx = allB.findIndex(x => x.booking.id === booking.booking.id);
      if(bIdx > -1) {
         allB[bIdx] = newBooking;
         localStorage.setItem("krishak-mitra-all-bookings", JSON.stringify(allB));
      }
      
      toast.success("Payment requested successfully!");
      setShowPaymentModal(false);
    } catch (err) {
      toast.error("Failed to request payment");
    }
  };

  async function createAuction(event) {
    event.preventDefault();
    setAuctionSaving(true);
    try {
      const targetCropId = auctionCrop || crops[0]?.id;
      const selectedCropRecord = crops.find((crop) => crop?.id === targetCropId);
      const cropNameToUse = useManualCrop ? manualCropName : selectedCropRecord?.name;
      const listing = await createAuctionDirectly({ farmerId: farmerId || config.farmerId, cropId: targetCropId, cropName: cropNameToUse, quantity: auctionQuantity, basePrice: auctionBasePrice, grade: auctionGrade });
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
    { id: "bidding", label: t("liveBidding") || "Live Bidding", icon: Gavel },
  ];

  let currentStep = 0; 
  if (booking) {
    currentStep = 1;
    if (queueEntry) {
      currentStep = 2;
      if (procurement) {
        currentStep = 3;
        if (procurement?.procurement_status === "ACCEPTED") {
           currentStep = 4;
           if (payment?.payment_status === "PAID" || payment?.payment_status === "COMPLETED" || payment?.payment_status === "SUCCESS") { 
              currentStep = 5;
           }
        }
      }
    }
  }

  const journeySteps = [
    { title: "Booking", subtitle: booking ? "Confirmed" : "Not booked" },
    { title: "Arrival", subtitle: queueEntry ? "In Queue" : "Expected" },
    { title: "Quality", subtitle: procurement ? (procurement.quality_grade || "Graded") : "Pending" },
    { title: "Acceptance", subtitle: procurement?.procurement_status === "ACCEPTED" ? "Accepted" : "Pending" },
    { title: "Payment", subtitle: payment ? `${payment.amount}` : "Pending" },
  ];

  const activeCrop = crops.find((c) => c.id === (booking?.booking?.crops?.[0]?.crop_id || selectedCrops[0]));

  const availableCrops = crops.filter(c => {
    const centre = centres.find(cen => cen.id === selectedCentre);
    if (!centre || !centre.supported_crops || centre.supported_crops.length === 0) return true; // fallback
    return centre.supported_crops.includes(c.id);
  });

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    if (tabId === "bookings") {
      setBookingStep(0);
      setShowNewBookingForm(false);
    }
    if (tabId === "notifications" && notifications.some(n => !n.read)) {
      await api.markNotificationsRead();
      setNotifications(notifications.map(n => ({...n, read: true})));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  const greeting = getGreeting();
  const displayName = farmerName || "Ramesh Kumar";

  return (
    <SidebarLayout
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={onLogout} onHome={onHome}
      language={language}
      onLanguageChange={onLanguageChange}
      displayName={displayName}
    >
      
      {activeTab === "dashboard" && (
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <div className="mb-6">
              <Eyebrow>OVERVIEW</Eyebrow>
              <h1 className="font-display text-4xl font-extrabold text-forest mt-2">{greeting}, {displayName}</h1>
              <p className="text-muted text-base mt-2">{t("journeyIntro")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveTab("bookings")} className="text-left rounded-2xl border border-line bg-surface p-4 hover:border-brand/40 hover:shadow-sm transition-all">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">{t("apmcWorkflow") || "APMC workflow"}</p>
                <p className="font-bold text-forest mt-1">{t("bookMandiSlot") || "Book a mandi slot"}</p>
                <p className="text-xs text-muted mt-1">{t("chooseCentreTimeQuantity") || "Choose a centre, time, and quantity."}</p>
              </button>
              <button onClick={() => setActiveTab("bidding")} className="text-left rounded-2xl border border-brand/30 bg-green-50/70 p-4 hover:border-brand hover:shadow-sm transition-all">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">{t("privateMarket") || "Private market"}</p>
                <p className="font-bold text-forest mt-1">{t("sellToDirectBuyers") || "Sell to direct buyers"}</p>
                <p className="text-xs text-muted mt-1">{t("postCropReceiveBids") || "Post your crop and receive competing bids."}</p>
              </button>
            </div>

            <div className="bg-surface border border-line rounded-3xl p-4 sm:p-6 flex flex-col gap-6 shadow-sm sm:flex-row">
              <div className="min-w-0 flex-1">
                <Eyebrow className="mb-4">{booking ? t("bookingConfirmed") : t("nextStep")}</Eyebrow>
                {booking ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-line cursor-pointer" onClick={() => setShowQRModal(true)}>
                        {booking?.token?.token_number && <QRCode value={JSON.stringify({ ticketId: booking?.booking?.id, tokenNumber: booking?.token?.token_number, farmerName: farmerName || booking?.booking?.farmer_name || "Unknown", crops: (booking?.booking?.crops || []).map(c => ({ name: c.crop_name, quantity: c.quantity })), centerId: booking?.booking?.centre_id, centreName: centres.find(c => c.id === booking?.booking?.centre_id)?.name || "Unknown", status: booking?.booking?.status || "BOOKED" })} size={64} level="H" />}
                      </div>
                      <div className="min-w-0">
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
                    <Button className="w-full mt-4 gap-2 bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowQRModal(true)}><QrCode className="w-4 h-4" /> View Gate Pass</Button>
                    <Button className="w-full mt-2 gap-2" variant="outline" onClick={() => setActiveTab("token")}>{t("yourToken")} <ChevronRight className="w-4 h-4" /></Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted font-medium mb-4">{t("bookSlot")}</p>
                    <Button onClick={() => setActiveTab("bookings")}>{t("bookSlot")}</Button>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 border-t border-line pt-6 flex flex-col items-center justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <div className="w-full flex justify-between items-center mb-4">
                  <Eyebrow>{t("capacityUsed")}</Eyebrow>
                  <Badge tone="success"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" /> {t("open")}</Badge>
                </div>
                <div className="flex items-center justify-between w-full mt-2">
                  <div className="text-center">
                    <p className="text-xs text-muted font-bold">{t("liveQueue")}</p>
                    <p className="text-sm font-bold text-forest">{liveQueueStats.farmers_in_queue} {t("farmers")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted font-bold">{t("estimatedArrival")}</p>
                    <p className="text-sm font-bold text-forest">{liveQueueStats.estimated_wait_time} min</p>
                  </div>
                  <CircularProgress value={81} label="Capacity" />
                </div>
              </div>
            </div>

            <Card>
              <Eyebrow className="mb-6">{t("procurementJourney")}</Eyebrow>
              <ProgressTimeline steps={journeySteps} currentStep={currentStep} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <Eyebrow>{t("centre")}</Eyebrow>
                <span className="text-xs text-brand font-bold">2.4 km</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <MapPin className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="font-bold text-forest text-sm">{centres.find(c => c.id === selectedCentre)?.name || "Unknown Centre"}</p>
                  <p className="text-xs text-muted font-medium mt-1">{t("open")}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6" onClick={() => setActiveTab("centres")}>{t("centre")} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card className="bg-forest text-white border-transparent shadow-xl">
              <Eyebrow dark className="mb-4">{t("liveQueue")}</Eyebrow>
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
                  {booking?.booking?.allocated_time_minutes && (
                    <div className="mb-6 p-4 bg-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Allocated Time</p>
                        <p className="font-bold text-lg">{booking.booking.allocated_time_minutes} min</p>
                      </div>
                      <Button variant="outline" className="text-white border-white/30 hover:bg-white/20" size="sm" onClick={() => toast.success("More time requested!")}>Request More</Button>
                    </div>
                  )}
                  <Button className="w-full bg-white text-forest hover:bg-slate-100" onClick={() => setActiveTab("queue")}>{t("viewQueue")} <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </>
              ) : (
                <p className="text-sm font-medium text-white/70 py-4">{t("nextStep")}</p>
              )}
            </Card>

            <Card>
              <Eyebrow className="mb-4">{t("recentUpdates")}</Eyebrow>
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

      
      {activeTab === "centres" && (
        <div className="min-w-0 max-w-4xl mx-auto space-y-4">
          <Eyebrow className="mb-2">{t("centre")}</Eyebrow>
          <h1 className="font-display text-4xl font-extrabold text-forest mb-8">Select a Procurement Centre</h1>
          {centres.map((c) => (
            <Card key={c.id} className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="break-words font-bold text-forest">{c.name}</p>
                  <p className="break-words text-xs text-muted font-medium mt-1">{c.district} &bull; Capacity: {c.daily_capacity} q/day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="success">{t("open")}</Badge>
                <Button variant={selectedCentre === c.id ? "primary" : "outline"} size="sm" onClick={() => { setSelectedCentre(c.id); setActiveTab("bookings"); }}>
                  {selectedCentre === c.id ? "Selected" : "Book Here"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      
      {activeTab === "bookings" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {booking && !showNewBookingForm ? (
            <Card className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="w-8 h-8 text-brand" />
              </div>
              <h2 className="font-display text-2xl font-bold text-forest mb-3">Active Booking Found</h2>
              <p className="text-muted mb-8 max-w-md mx-auto">
                You already have a confirmed booking at {centres.find((c) => c.id === booking?.booking?.centre_id)?.name || "a centre"}. Creating a new booking will override your current one.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" onClick={() => setActiveTab("dashboard")}>View Current Booking</Button>
                <Button onClick={() => setShowNewBookingForm(true)}>Create New Booking</Button>
              </div>
            </Card>
          ) : (
            <Card className="min-w-0 overflow-hidden p-0 shadow-lg">
            <div className="flex items-center gap-4 overflow-x-auto border-b border-line bg-slate-50/50 p-4 sm:p-6">
              {["Centre", "Crop", "Quantity", "Slot", "Confirm"].map((step, idx) => {
                const isActive = bookingStep === idx;
                const isCompleted = bookingStep > idx;
                // Allow clicking if it's a completed step or the very next step we can access
                const canClick = idx <= bookingStep || (idx === bookingStep + 1 && ((bookingStep === 0 && selectedCentre) || (bookingStep === 1 && selectedCrops.length > 0) || (bookingStep === 2 && Object.values(quantities).some(q => q > 0)) || (bookingStep === 3 && selectedSlot)));
                
                return (
                  <button 
                    key={idx} 
                    onClick={() => canClick && setBookingStep(idx)}
                    disabled={!canClick}
                    className={`flex items-center gap-2 whitespace-nowrap text-sm font-bold focus:outline-none transition-colors ${isActive ? "text-brand" : isCompleted ? "text-forest cursor-pointer" : "text-muted opacity-60 cursor-not-allowed"}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white transition-colors ${isActive ? "bg-brand shadow-md" : isCompleted ? "bg-forest" : "bg-slate-300"}`}>
                      {idx + 1}
                    </span>
                    {step}
                  </button>
                );
              })}
            </div>
            <div className="p-4 sm:p-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${bookingStep}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {bookingStep === 0 && (
                    <div>
                      <h2 className="font-display text-xl font-bold text-forest mb-4">Select a Centre</h2>
                      <Select value={selectedCentre} onChange={(e) => setSelectedCentre(e.target.value)} className="shadow-sm">
                        <option value="" disabled>Select Centre</option>
                        {centres.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
                      </Select>
                      <div className="mt-8 flex justify-end">
                        <Button onClick={() => setBookingStep(1)} disabled={!selectedCentre}>Next step</Button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 1 && (
                    <div>
                      <h2 className="font-display text-xl font-bold text-forest mb-4">Select your Crops</h2>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableCrops.map((c) => (
                          <label key={c.id} className="flex items-center gap-3 p-3 bg-white border border-line rounded-xl cursor-pointer hover:border-brand/30 transition-all">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-brand accent-brand" 
                              checked={selectedCrops.includes(c.id)} 
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCrops(prev => [...prev, c.id]);
                                  setQuantities(prev => ({...prev, [c.id]: 40})); // default 40
                                } else {
                                  setSelectedCrops(prev => prev.filter(id => id !== c.id));
                                  const newQ = {...quantities};
                                  delete newQ[c.id];
                                  setQuantities(newQ);
                                }
                              }} 
                            />
                            <span className="text-sm font-bold text-forest">{c.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-8 flex justify-between">
                        <Button variant="ghost" onClick={() => setBookingStep(0)}>Back</Button>
                        <Button onClick={() => setBookingStep(2)} disabled={selectedCrops.length === 0}>Next step</Button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 2 && (
                    <div>
                      <h2 className="font-display text-xl font-bold text-forest mb-4">Estimated Quantity (Quintals)</h2>
                      <div className="space-y-4">
                        {selectedCrops.map(cropId => {
                          const crop = crops.find(c => c.id === cropId);
                          return (
                            <div key={cropId} className="flex items-center justify-between p-3 bg-white border border-line rounded-xl">
                              <span className="text-sm font-bold text-forest">{crop?.name}</span>
                              <div className="w-1/3">
                                <Input type="number" min="1" value={quantities[cropId] || ""} onChange={(e) => setQuantities(prev => ({...prev, [cropId]: e.target.value}))} className="shadow-sm h-10" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-8 flex justify-between">
                        <Button variant="ghost" onClick={() => setBookingStep(1)}>Back</Button>
                        <Button onClick={() => setBookingStep(3)} disabled={selectedCrops.some(id => !quantities[id] || Number(quantities[id]) <= 0)}>Next step</Button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 3 && (
                    <div>
                      <h2 className="font-display text-xl font-bold text-forest mb-4">Choose a Time Slot</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                        {slots.length > 0 ? slots.map((slot, i) => {
                          const isAvailable = slot.tone === "green";
                          return (
                            <motion.button 
                              whileHover={isAvailable ? { scale: 1.02 } : {}}
                              whileTap={isAvailable ? { scale: 0.98 } : {}}
                              key={slot.id} 
                              onClick={() => isAvailable && setSelectedSlot(slot.id)} 
                              disabled={!isAvailable}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left shadow-sm ${
                                selectedSlot === slot.id ? "border-brand bg-green-50 ring-2 ring-brand/10 shadow-md"
                                  : isAvailable ? "border-line bg-surface hover:border-brand/30" : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                              }`}>
                              <div>
                                <p className="font-bold text-forest text-sm">{slot.date} &bull; {slot.time}</p>
                                <p className="text-xs text-muted font-medium mt-1">{slot.remaining} q available</p>
                              </div>
                              <Badge tone={isAvailable ? "success" : "default"}>{isAvailable ? "Available" : "Full"}</Badge>
                            </motion.button>
                          );
                        }) : (
                          <p className="text-muted py-4 col-span-2 text-center">No slots available for this centre.</p>
                        )}
                      </div>
                      <div className="mt-8 flex justify-between">
                        <Button variant="ghost" onClick={() => setBookingStep(2)}>Back</Button>
                        <Button onClick={() => setBookingStep(4)} disabled={!selectedSlot}>Review Booking</Button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 4 && (
                    <div>
                      <h2 className="font-display text-xl font-bold text-forest mb-4">Review & Confirm</h2>
                      <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-line">
                        <div className="flex justify-between border-b border-line pb-4">
                          <span className="text-muted font-medium">Centre</span>
                          <span className="font-bold text-forest">{centres.find(c => c.id === selectedCentre)?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b border-line pb-4">
                          <span className="text-muted font-medium">Crops & Quantity</span>
                          <div className="text-right">
                            {selectedCrops.map(cropId => (
                              <div key={cropId} className="font-bold text-forest text-sm">
                                {crops.find(c => c.id === cropId)?.name}: {quantities[cropId]} q
                              </div>
                            ))}
                            <div className="text-xs text-muted mt-1 font-bold">Total: {selectedCrops.reduce((sum, id) => sum + Number(quantities[id] || 0), 0)} q</div>
                          </div>
                        </div>
                        <div className="flex justify-between border-b border-line pb-4">
                          <span className="text-muted font-medium">Estimated Revenue</span>
                          <span className="font-bold text-brand text-lg">₹ {selectedCrops.reduce((sum, cropId) => {
                            const crop = crops.find(c => c.id === cropId);
                            const q = Number(quantities[cropId] || 0);
                            const msp = crop ? Number(crop.minimum_support_price || 0) : 0;
                            return sum + (q * msp);
                          }, 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted font-medium">Slot</span>
                          <span className="font-bold text-forest">
                            {slots.find(s => s.id === selectedSlot)?.date || "N/A"} &bull; {slots.find(s => s.id === selectedSlot)?.time || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-stretch gap-3 pt-6 mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button className="w-full sm:w-auto" variant="ghost" onClick={() => setBookingStep(3)}>Back</Button>
                        <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow" onClick={createBooking} disabled={!selectedSlot || selectedCrops.length === 0}>{t("confirmBooking")} <ArrowRight className="w-4 h-4 ml-2" /></Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            </Card>
          )}
        </motion.div>
      )}

      
      {activeTab === "token" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-w-0 max-w-md mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("dashboard")}>
              Back
            </Button>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-forest text-center flex-1">Digital Token</h1>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              Download
            </Button>
          </div>
          {booking?.token?.token_number ? (
            <div className="relative overflow-hidden bg-white rounded-3xl border border-line shadow-2xl drop-shadow-xl">
              
              <div className="bg-forest p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <p className="text-xs font-bold text-brand uppercase tracking-widest mb-1 relative z-10">Confirmed Booking</p>
                <h2 className="font-display text-3xl font-extrabold relative z-10">{booking?.booking?.date || "TBD"}</h2>
              </div>
              
              
              <div className="relative flex items-center justify-between -mt-3 z-20">
                 <div className="w-6 h-6 bg-[#F8F9FA] rounded-full -ml-3 shadow-inner"></div>
                 <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2"></div>
                 <div className="w-6 h-6 bg-[#F8F9FA] rounded-full -mr-3 shadow-inner"></div>
              </div>

              
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-white p-6 rounded-2xl border-2 border-brand/20 shadow-inner flex flex-col items-center gap-4">
                  <QRCode value={JSON.stringify({ ticketId: booking.booking?.id, tokenNumber: booking.token.token_number, farmerName: farmerName || booking.booking?.farmer_name || "Unknown", crops: (booking.booking?.crops || []).map(c => ({ name: c.crop_name, quantity: c.quantity })), totalQuantity: booking.booking?.estimated_quantity || 0, centerId: booking.booking?.centre_id, centreName: centres.find(c => c.id === booking.booking?.centre_id)?.name || "Unknown", slotTime: booking.booking?.slot_time || "N/A", date: booking.booking?.date || new Date().toISOString().split("T")[0], status: booking.booking?.status || "BOOKED", estimatedFare: booking.booking?.estimated_fare || 0 })} size={200} level="H" className="w-48 h-48 sm:w-64 sm:h-64" />
                  <p className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-brand bg-brand/5 px-6 py-2 rounded-xl border border-brand/20">
                    {booking.token.token_number}
                  </p>
                </div>
                
                <div className="w-full mt-8 bg-slate-50 rounded-2xl p-4 flex justify-between items-center text-left">
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Crops</p>
                     <div className="font-bold text-forest">
                       {booking?.booking?.crops ? booking.booking.crops.map(c => <div key={c.crop_id}>{c.crop_name}</div>) : "Unknown"}
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Quantity</p>
                     <div className="font-bold text-forest">
                       {booking?.booking?.crops ? booking.booking.crops.map(c => <div key={c.crop_id}>{c.quantity} q</div>) : "0 q"}
                     </div>
                   </div>
                </div>

                <Button className="w-full mt-6 gap-2 bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowQRModal(true)}>
                  <QrCode className="w-4 h-4" /> View Full Gate Pass
                </Button>
              </div>
              
              
              <div className="bg-slate-50 border-t border-line p-4 text-center">
                 <p className="text-xs text-slate-500 font-medium">Please present this QR code at the gate</p>
              </div>
            </div>
          ) : (
            <Card className="flex flex-col items-center gap-6 text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <p className="text-forest font-bold text-lg mb-1">No token yet</p>
                <p className="text-muted font-medium">Book a slot to generate your gate pass.</p>
              </div>
              <Button onClick={() => setActiveTab("bookings")} className="mt-2">Book a Slot</Button>
            </Card>
          )}
        </motion.div>
      )}

      
      {activeTab === "queue" && (
        <div className="min-w-0 max-w-2xl mx-auto">
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

      
      {activeTab === "procurement" && (
        <div className="min-w-0 max-w-2xl mx-auto space-y-4">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Procurement Details</h1>
          {procurement ? (
            <Card>
              <div className="space-y-4">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-bold text-muted">Status</span>
                  <Badge tone="warning">{procurement.procurement_status}</Badge>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-bold text-muted">Actual Quantity</span>
                  <span className="text-sm font-bold text-forest">{procurement.actual_quantity} q</span>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
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

      
      {activeTab === "payment" && (
        <div className="min-w-0 max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-forest mb-6">Payment Status</h1>
          {booking?.booking ? (
            <Card>
              <div className="space-y-6">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-line">
                  <span className="text-sm font-bold text-muted">Estimated Revenue (MSP)</span>
                  <span className="text-xl font-extrabold text-forest">&#8377; {booking.booking.estimated_fare?.toLocaleString("en-IN") || 0}</span>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-bold text-muted">Status</span>
                  <Badge tone={booking.booking.status === 'PAID' ? 'success' : booking.booking.status === 'PAYMENT_REQUESTED' ? 'warning' : 'default'} className="text-sm">
                    {booking.booking.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                
                {booking.booking.status === "PAID" && booking.booking.receipt_url && (
                  <div className="pt-4 mt-4 border-t border-line">
                    <p className="text-sm font-bold text-forest mb-4">Payment Receipt</p>
                    {booking.booking.receipt_url.startsWith("data:image") ? (
                      <img src={booking.booking.receipt_url} alt="Receipt" className="max-w-full rounded-xl border border-line" />
                    ) : (
                      <a href={booking.booking.receipt_url} target="_blank" rel="noreferrer" className="text-brand hover:underline font-bold text-sm">Download Receipt (PDF)</a>
                    )}
                  </div>
                )}

                {["QUALITY_CHECK", "WEIGHING", "ACCEPTED"].includes(booking.booking.status) && (
                  <div className="pt-4 border-t border-line">
                    <Button variant="primary" className="w-full" onClick={() => setShowPaymentModal(true)}>
                      Request Payment
                    </Button>
                  </div>
                )}
                
                {booking.booking.status === "PAYMENT_REQUESTED" && (
                  <div className="pt-4 border-t border-line text-center text-sm font-medium text-amber-600 bg-amber-50 p-4 rounded-xl border-amber-100">
                    Payment request submitted. Awaiting processing by the administrator.
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-10">
              <p className="text-muted font-medium">Payment details will appear after procurement is accepted.</p>
            </Card>
          )}
        </div>
      )}

      
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
                      <Select value={auctionCrop} onChange={(event) => setAuctionCrop(event.target.value)} required>
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
                <Button type="submit" disabled={auctionSaving || (!auctionCrop && !crops[0]?.id && !useManualCrop) || (useManualCrop && !manualCropName)}>{auctionSaving ? "Publishing..." : "Publish private listing"}</Button>
              </form>
            </Card>
          ) : (
            auctions.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{auctions.map((auction) => <AuctionCard key={auction?.id} auction={auction} role="farmer" onUpdated={(auctionId) => setAuctions((current) => current.map((item) => item?.id === auctionId ? { ...item, status: "awarded" } : item))} onRemoved={(auctionId) => setAuctions((current) => current.filter((item) => item?.id !== auctionId))} />)}</div> : <Card className="text-center py-10"><p className="text-muted font-medium">You have no private market listings yet.</p><Button className="mt-4" onClick={() => setAuctionTab("create")}>Post your first crop</Button></Card>
          )}
        </div>
      )}

      
      {activeTab === "notifications" && (
        <div className="min-w-0 max-w-2xl mx-auto">
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
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.read ? 'bg-slate-300' : 'bg-brand'}`} />
                    <div>
                      <p className="text-sm font-bold text-forest">{n.message}</p>
                      <p className="text-xs text-muted mt-0.5">{new Date(n.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted font-medium text-center py-8">No notifications yet.</p>
            )}
          </Card>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-line bg-slate-50">
              <h3 className="font-display font-bold text-lg text-forest">Verify Contact Details</h3>
              <p className="text-sm text-muted">Please provide your mobile number and bank account details for payment.</p>
            </div>
            <form onSubmit={handleRequestPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-forest mb-2">Mobile Number</label>
                <Input type="text" value={paymentForm.mobile} onChange={e => setPaymentForm({ ...paymentForm, mobile: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-forest mb-2">Bank Account</label>
                <Input type="text" value={paymentForm.bank} onChange={e => setPaymentForm({ ...paymentForm, bank: e.target.value })} required placeholder="E.g., SBI A/C 1234..." />
              </div>
              <div className="flex gap-3 pt-4 border-t border-line mt-6">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Update & Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Gate Pass Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        slotData={{
          booking: booking?.booking,
          token: booking?.token,
          farmerName: farmerName || booking?.booking?.farmer_name,
          centreName: centres.find(c => c.id === booking?.booking?.centre_id)?.name || "Unknown Centre",
        }}
      />
    </SidebarLayout>
  );
}
