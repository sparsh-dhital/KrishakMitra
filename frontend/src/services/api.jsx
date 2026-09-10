import { useEffect, useState } from "react";

export function useLiveSync() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key && e.key.startsWith("krishak-mitra")) {
        setTick((t) => t + 1);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  return tick;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const defaultCentres = [
  {
    id: "c1",
    name: "Mangalagiri Procurement Centre",
    district: "Guntur",
    daily_capacity: 5000,
    supported_crops: ["cr1", "cr2"],
  },
  {
    id: "c2",
    name: "Tenali Market Yard",
    district: "Guntur",
    daily_capacity: 3500,
    supported_crops: ["cr1", "cr3"],
  },
  {
    id: "c3",
    name: "Amaravati Main Hub",
    district: "Palnadu",
    daily_capacity: 8000,
    supported_crops: ["cr1", "cr2", "cr3"],
  },
];

function getStoredCentres() {
  const saved = localStorage.getItem("krishak-mitra-centres");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  localStorage.setItem("krishak-mitra-centres", JSON.stringify(defaultCentres));
  return defaultCentres;
}

function saveCentres(centres) {
  localStorage.setItem("krishak-mitra-centres", JSON.stringify(centres));
}

function getStoredCrops() {
  const saved = localStorage.getItem("krishak-mitra-crops");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  const defaultCrops = [
    { id: "cr1", name: "Paddy (Grade A)", minimum_support_price: 2203 },
    { id: "cr2", name: "Cotton (Long Staple)", minimum_support_price: 7020 },
    { id: "cr3", name: "Maize", minimum_support_price: 2090 },
  ];
  localStorage.setItem("krishak-mitra-crops", JSON.stringify(defaultCrops));
  return defaultCrops;
}

function saveCrops(crops) {
  localStorage.setItem("krishak-mitra-crops", JSON.stringify(crops));
}

function getStoredNotifications() {
  const saved = localStorage.getItem("krishak-mitra-notifications");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
}

function addNotification(message, type = "info", data = {}) {
  const notifs = getStoredNotifications();
  notifs.unshift({
    id: "n-" + Date.now(),
    message,
    type,
    data,
    read: false,
    date: new Date().toISOString(),
  });
  localStorage.setItem("krishak-mitra-notifications", JSON.stringify(notifs));
}

const defaultSlots = [
  {
    id: "s1",
    centre_id: "c1",
    date: "2026-09-10",
    start_time: "09:00",
    end_time: "09:30",
    capacity_quintals: 20,
    booked_quintals: 8,
  },
  {
    id: "s2",
    centre_id: "c1",
    date: "2026-09-10",
    start_time: "09:30",
    end_time: "10:00",
    capacity_quintals: 20,
    booked_quintals: 12,
  },
  {
    id: "s3",
    centre_id: "c1",
    date: "2026-09-10",
    start_time: "10:30",
    end_time: "11:00",
    capacity_quintals: 20,
    booked_quintals: 2,
  },
  {
    id: "s4",
    centre_id: "c1",
    date: "2026-09-10",
    start_time: "11:00",
    end_time: "11:30",
    capacity_quintals: 20,
    booked_quintals: 18,
  },
  {
    id: "s5",
    centre_id: "c1",
    date: "2026-09-10",
    start_time: "11:30",
    end_time: "12:00",
    capacity_quintals: 20,
    booked_quintals: 20,
  },
];

function getStoredSlots() {
  const saved = localStorage.getItem("krishak-mitra-slots");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  localStorage.setItem("krishak-mitra-slots", JSON.stringify(defaultSlots));
  return defaultSlots;
}

function saveSlots(slots) {
  localStorage.setItem("krishak-mitra-slots", JSON.stringify(slots));
}

function getStoredBookings() {
  const saved = localStorage.getItem("krishak-mitra-all-bookings");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
}

function saveBookings(bookings) {
  localStorage.setItem("krishak-mitra-all-bookings", JSON.stringify(bookings));
}

function getStoredProcurement() {
  try {
    return JSON.parse(
      localStorage.getItem("krishak-mitra-procurement") || "{}",
    );
  } catch {
    return {};
  }
}

function saveProcurement(records) {
  localStorage.setItem("krishak-mitra-procurement", JSON.stringify(records));
}

function getStoredFarmers() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("krishak-mitra-farmers") || "[]",
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFarmers(farmers) {
  localStorage.setItem("krishak-mitra-farmers", JSON.stringify(farmers));
}

export const api = {
  getCentres: async () => {
    await delay(300);
    return getStoredCentres();
  },
  createCentre: async (payload) => {
    await delay(500);
    const centres = getStoredCentres();
    const newCentre = {
      id: "c-" + Math.random().toString(36).substring(7),
      name: payload.name,
      district: payload.district,
      daily_capacity: payload.daily_capacity,
      supported_crops: payload.supported_crops || [],
    };
    centres.push(newCentre);
    saveCentres(centres);

    if (payload.slots && payload.slots.length > 0) {
      const allSlots = getStoredSlots();
      const centreSlots = payload.slots.map((s) => ({
        ...s,
        id: "s-" + Math.random().toString(36).substring(7),
        centre_id: newCentre.id,
      }));
      saveSlots([...allSlots, ...centreSlots]);
    }

    addNotification("", "centrePublished", {
      name: newCentre.name,
      district: newCentre.district,
    });
    return newCentre;
  },
  updateCentre: async (id, payload) => {
    await delay(500);
    const centres = getStoredCentres();
    const idx = centres.findIndex((c) => c.id === id);
    if (idx > -1) {
      centres[idx] = {
        ...centres[idx],
        name: payload.name,
        district: payload.district,
        daily_capacity: payload.daily_capacity,
        supported_crops:
          payload.supported_crops || centres[idx].supported_crops,
      };
      saveCentres(centres);

      if (payload.slots && payload.slots.length > 0) {
        let allSlots = getStoredSlots().filter((s) => s.centre_id !== id);
        const centreSlots = payload.slots.map((s) => ({
          ...s,
          id: "s-" + Math.random().toString(36).substring(7),
          centre_id: id,
        }));
        saveSlots([...allSlots, ...centreSlots]);
      }

      return centres[idx];
    }
    throw new Error("Centre not found");
  },
  deleteCentre: async (id) => {
    await delay(500);
    let centres = getStoredCentres();
    centres = centres.filter((c) => c.id !== id);
    saveCentres(centres);
    return { success: true };
  },
  getNotifications: async () => {
    return getStoredNotifications();
  },
  markNotificationsRead: async () => {
    const notifs = getStoredNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem("krishak-mitra-notifications", JSON.stringify(notifs));
    return { success: true };
  },
  getCrops: async () => {
    await delay(300);
    return getStoredCrops();
  },
  addCrop: async (name, msp) => {
    await delay(300);
    const crops = getStoredCrops();
    const newCrop = {
      id: "cr-" + Math.random().toString(36).substring(7),
      name,
      minimum_support_price: msp || 0,
    };
    crops.push(newCrop);
    saveCrops(crops);
    return newCrop;
  },
  updateCrop: async (id, name, msp) => {
    await delay(300);
    const crops = getStoredCrops();
    const idx = crops.findIndex((c) => c.id === id);
    if (idx > -1) {
      crops[idx].name = name;
      crops[idx].minimum_support_price = msp || 0;
      saveCrops(crops);
      return crops[idx];
    }
    throw new Error("Crop not found");
  },
  deleteCrop: async (id) => {
    await delay(300);
    let crops = getStoredCrops();
    crops = crops.filter((c) => c.id !== id);
    saveCrops(crops);
    return { success: true };
  },
  getFarmer: async (farmerId) => {
    await delay(300);
    const stored = getStoredFarmers().find((item) => item.id === farmerId);
    if (stored) return stored;
    const farmer = {
      id: farmerId,
      full_name: "Ramesh Kumar",
      mobile_number: "+91 98765 43210",
      district: "Guntur",
      email: "ramesh.kumar@example.com",
      kyc_status: "VERIFIED",
      land_area: "5.4 Acres",
      bank_account: "**** **** 4567",
      kyc_status: "pending",
      kyc_note: "",
    };
    saveFarmers([...getStoredFarmers(), farmer]);
    return farmer;
  },
  getFarmers: async () => {
    const stored = getStoredFarmers();
    if (stored.length) return stored;
    return [
      ...new Map(
        getStoredBookings().map((item) => [
          item.booking?.farmer_id,
          {
            id: item.booking?.farmer_id,
            name: item.booking?.farmer_name || "Unknown Farmer",
            phone: item.booking?.farmer_mobile || "",
            village: "",
            aadhaar_ref: "",
            land_details: {},
            kyc_status: "pending",
            kyc_note: "",
          },
        ]),
      ).values(),
    ].filter((item) => item.id);
  },
  updateFarmerProfile: async (farmerId, payload) => {
    const farmers = getStoredFarmers();
    const index = farmers.findIndex((item) => item.id === farmerId);
    const current = index >= 0 ? farmers[index] : await api.getFarmer(farmerId);
    const updated = {
      ...current,
      ...payload,
      kyc_status: "pending",
      kyc_note: "",
    };
    if (index >= 0) farmers[index] = updated;
    else farmers.push(updated);
    saveFarmers(farmers);
    return updated;
  },
  reviewFarmerKyc: async (farmerId, status, note = "") => {
    const farmers = getStoredFarmers();
    const index = farmers.findIndex((item) => item.id === farmerId);
    if (index < 0) throw new Error("Farmer profile not found");
    farmers[index] = { ...farmers[index], kyc_status: status, kyc_note: note };
    saveFarmers(farmers);
    return farmers[index];
  },
  getSlots: async (centreId, date) => {
    await delay(400);
    const slots = getStoredSlots().filter((s) => s.centre_id === centreId);
    return slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
  },
  createBooking: async (payload) => {
    await delay(500);

    // Calculate total quantity, time, and estimated fare
    const allCrops = getStoredCrops();
    let totalQuantity = 0;
    let estimatedFare = 0;

    const cropsWithPricing = payload.crops.map((c) => {
      const cropDetails = allCrops.find((cr) => cr.id === c.crop_id);
      const msp = cropDetails ? cropDetails.minimum_support_price : 0;
      const quantity = Number(c.quantity) || 0;
      const total = quantity * msp;

      totalQuantity += quantity;
      estimatedFare += total;

      return {
        ...c,
        minimum_support_price: msp,
        total_fare: total,
      };
    });

    const allocatedTime = 5 + totalQuantity * 10; // 5 mins base + 10 mins per quintal (1 min per 10kg)

    const slots = getStoredSlots();
    const slot = slots.find((s) => s.id === payload.slot_id);
    const slotTime = slot
      ? `${slot.start_time} - ${slot.end_time}`
      : "Unknown Time";

    const newBooking = {
      booking: {
        id: "b-" + Math.random().toString(36).substring(7),
        farmer_id: payload.farmer_id,
        farmer_name: payload.farmer_name,
        centre_id: payload.centre_id,
        slot_id: payload.slot_id,
        slot_time: slotTime,
        crops: cropsWithPricing, // Array of {crop_id, crop_name, quantity, minimum_support_price, total_fare}
        estimated_quantity: totalQuantity,
        estimated_fare: estimatedFare,
        allocated_time_minutes: allocatedTime,
        status: "BOOKED",
        date: new Date().toISOString().split("T")[0],
      },
      token: {
        id: "t-" + Math.random().toString(36).substring(7),
        token_number: "A" + Math.floor(1000 + Math.random() * 9000),
      },
    };
    const bookings = getStoredBookings();
    bookings.push(newBooking);
    saveBookings(bookings);
    addNotification("", "bookingCreated", {
      farmer: newBooking.booking.farmer_name || "Farmer",
      slot: slotTime,
    });
    return newBooking;
  },
  getAllBookings: async () => {
    await delay(300);
    return getStoredBookings();
  },
  getBooking: async (bookingId) => {
    await delay(200);
    const bookings = getStoredBookings();
    const b = bookings.find((x) => x.booking.id === bookingId);
    if (b) return b.booking;
    // Fallback for older format
    return {
      id: bookingId,
      status: "BOOKED",
      estimated_quantity: 40,
      date: new Date().toISOString().split("T")[0],
    };
  },
  updateBookingStatus: async (bookingId, status) => {
    await delay(300);
    const bookings = getStoredBookings();
    const idx = bookings.findIndex((x) => x.booking.id === bookingId);
    let updatedBooking = { id: bookingId, status };
    if (idx > -1) {
      bookings[idx].booking.status = status;
      updatedBooking = bookings[idx].booking;
      saveBookings(bookings);
      const statusMap = {
        BOOKED: "BOOKED",
        CHECKED_IN: "CHECKED_IN",
        WAITING: "WAITING",
        WEIGHING: "WEIGHING",
        QUALITY_CHECK: "QUALITY_CHECK",
        ACCEPTED: "ACCEPTED",
        PAID: "PAID",
      };
      const records = getStoredProcurement();
      records[bookingId] = {
        ...(records[bookingId] || {}),
        id: records[bookingId]?.id || `p-${bookingId}`,
        booking_id: bookingId,
        procurement_status: statusMap[status] || status,
        actual_quantity:
          records[bookingId]?.actual_quantity ||
          bookings[idx].booking.estimated_quantity,
        quality_grade: records[bookingId]?.quality_grade || "Pending",
        updated_at: new Date().toISOString(),
      };
      saveProcurement(records);
      addNotification("", "bookingStatus", {
        farmer: bookings[idx].booking.farmer_name || "Farmer",
        status,
      });
    }
    return updatedBooking;
  },
  requestPayment: async (bookingId, mobile, bank) => {
    await delay(300);
    const bookings = getStoredBookings();
    const idx = bookings.findIndex((x) => x.booking.id === bookingId);
    let updatedBooking = null;
    if (idx > -1) {
      bookings[idx].booking.status = "PAYMENT_REQUESTED";
      if (mobile) bookings[idx].booking.farmer_mobile = mobile;
      if (bank) bookings[idx].booking.farmer_bank = bank;
      updatedBooking = bookings[idx].booking;
      saveBookings(bookings);
      addNotification("", "paymentRequested", {
        farmer: bookings[idx].booking.farmer_name || "Farmer",
      });
    }
    return updatedBooking;
  },
  processPayment: async (
    bookingId,
    receiptUrl = "https://example.com/receipt.pdf",
  ) => {
    await delay(400);
    const bookings = getStoredBookings();
    const idx = bookings.findIndex((x) => x.booking.id === bookingId);
    let updatedBooking = null;
    if (idx > -1) {
      bookings[idx].booking.status = "PAID";
      bookings[idx].booking.receipt_url = receiptUrl;
      updatedBooking = bookings[idx].booking;
      saveBookings(bookings);
    }
    return updatedBooking;
  },
  deleteBooking: async (bookingId) => {
    await delay(300);
    let bookings = getStoredBookings();
    bookings = bookings.filter((b) => b.booking.id !== bookingId);
    saveBookings(bookings);
    return { success: true };
  },
  getQueueEntry: async (tokenId) => {
    await delay(400);
    const bookings = getStoredBookings();
    const inQueue = bookings.filter(
      (b) => b.booking.status !== "PAID" && b.booking.status !== "COMPLETED",
    );
    const idx = inQueue.findIndex((b) => b.token.id === tokenId);
    if (idx === -1) return null;

    // Estimated wait time: sum of allocated time of all people ahead of this token
    const waitTime = inQueue
      .slice(0, idx + 1)
      .reduce(
        (acc, curr) => acc + (curr.booking.allocated_time_minutes || 30),
        0,
      );

    return {
      queue_position: idx + 1,
      status: inQueue[idx].booking.status,
      estimated_wait_time: waitTime,
    };
  },
  getLiveQueueStats: async (centreId) => {
    await delay(200);
    const bookings = getStoredBookings();
    const inQueue = bookings.filter(
      (b) =>
        b.booking.centre_id === centreId &&
        b.booking.status !== "PAID" &&
        b.booking.status !== "COMPLETED",
    );
    const totalWaitTime = inQueue.reduce(
      (acc, curr) => acc + (curr.booking.allocated_time_minutes || 30),
      0,
    );
    return {
      farmers_in_queue: inQueue.length,
      estimated_wait_time: totalWaitTime,
    };
  },
  getProcurement: async (bookingId) => {
    await delay(400);
    const records = getStoredProcurement();
    if (records[bookingId]) return records[bookingId];
    const booking = getStoredBookings().find(
      (item) => item.booking.id === bookingId,
    )?.booking;
    const record = {
      id: `p-${bookingId}`,
      booking_id: bookingId,
      procurement_status: booking?.status || "BOOKED",
      actual_quantity: booking?.estimated_quantity || 0,
      quality_grade: "Pending",
      updated_at: new Date().toISOString(),
    };
    records[bookingId] = record;
    saveProcurement(records);
    return record;
  },
  getPayment: async (procurementId, bookingId) => {
    await delay(400);
    const bookings = getStoredBookings();
    const b = bookings.find((x) => x.booking.id === bookingId);
    const amount = b && b.booking.estimated_fare ? b.booking.estimated_fare : 0;
    return {
      id: "pay-" + Math.random().toString(36).substring(7),
      amount: amount,
      payment_status: "PROCESSING",
      transaction_ref:
        "TXN-" + Math.random().toString(36).substring(7).toUpperCase(),
    };
  },
  health: async () => ({ status: "mocked" }),
  sendOtp: async (mobile) => {
    await delay(800);
    return { success: true, message: "OTP sent successfully" };
  },
  verifyOtp: async (payload) => {
    await delay(800);
    if (payload.role === "admin") {
      return { success: true, farmer_id: null };
    }
    return {
      success: true,
      farmer_id: config.farmerId,
    };
  },
};

export const config = {
  apiUrl: "MOCKED",
  docsUrl: "MOCKED",
  farmerId: "f-1234",
  defaultCropId: "cr1",
};

export function isUuid(value) {
  return true;
}

export function toUiSlot(slot) {
  if (!slot) return null;
  const remaining =
    Number(slot.capacity_quintals || 0) - Number(slot.booked_quintals || 0);

  let formattedDate = slot.date || "TBD";
  try {
    if (slot.date) {
      formattedDate = new Date(`${slot.date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        },
      );
    }
  } catch (err) {
    formattedDate = "Invalid Date";
  }

  return {
    id: slot.id,
    date: formattedDate,
    time: `${slot.start_time || ""} - ${slot.end_time || ""}`,
    remaining,
    tone: remaining < 5 ? "amber" : "green",
    raw: slot,
  };
}
