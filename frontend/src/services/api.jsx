const delay = (ms) => new Promise(res => setTimeout(res, ms));

const defaultCentres = [
  { id: "c1", name: "Mangalagiri Procurement Centre", district: "Guntur", daily_capacity: 5000, supported_crops: ["cr1", "cr2"] },
  { id: "c2", name: "Tenali Market Yard", district: "Guntur", daily_capacity: 3500, supported_crops: ["cr1", "cr3"] },
  { id: "c3", name: "Amaravati Main Hub", district: "Palnadu", daily_capacity: 8000, supported_crops: ["cr1", "cr2", "cr3"] }
];

function getStoredCentres() {
  const saved = localStorage.getItem("krishak-mitra-centres");
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
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
    try { return JSON.parse(saved); } catch (e) {}
  }
  const defaultCrops = [
      { id: "cr1", name: "Paddy (Grade A)", minimum_support_price: 2203 },
      { id: "cr2", name: "Cotton (Long Staple)", minimum_support_price: 7020 },
      { id: "cr3", name: "Maize", minimum_support_price: 2090 }
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
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

function addNotification(message) {
  const notifs = getStoredNotifications();
  notifs.unshift({ id: "n-" + Date.now(), message, read: false, date: new Date().toISOString() });
  localStorage.setItem("krishak-mitra-notifications", JSON.stringify(notifs));
}

const defaultSlots = [
  { id: "s1", centre_id: "c1", date: "2026-09-10", start_time: "09:00", end_time: "09:30", capacity_quintals: 20, booked_quintals: 8 },
  { id: "s2", centre_id: "c1", date: "2026-09-10", start_time: "09:30", end_time: "10:00", capacity_quintals: 20, booked_quintals: 12 },
  { id: "s3", centre_id: "c1", date: "2026-09-10", start_time: "10:30", end_time: "11:00", capacity_quintals: 20, booked_quintals: 2 },
  { id: "s4", centre_id: "c1", date: "2026-09-10", start_time: "11:00", end_time: "11:30", capacity_quintals: 20, booked_quintals: 18 },
  { id: "s5", centre_id: "c1", date: "2026-09-10", start_time: "11:30", end_time: "12:00", capacity_quintals: 20, booked_quintals: 20 }
];

function getStoredSlots() {
  const saved = localStorage.getItem("krishak-mitra-slots");
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
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
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
}

function saveBookings(bookings) {
  localStorage.setItem("krishak-mitra-all-bookings", JSON.stringify(bookings));
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
      const centreSlots = payload.slots.map(s => ({ ...s, id: "s-" + Math.random().toString(36).substring(7), centre_id: newCentre.id }));
      saveSlots([...allSlots, ...centreSlots]);
    }

    addNotification(`New Procurement Centre Published: ${newCentre.name} in ${newCentre.district}`);
    return newCentre;
  },
  updateCentre: async (id, payload) => {
    await delay(500);
    const centres = getStoredCentres();
    const idx = centres.findIndex(c => c.id === id);
    if (idx > -1) {
      centres[idx] = { 
        ...centres[idx], 
        name: payload.name,
        district: payload.district,
        daily_capacity: payload.daily_capacity,
        supported_crops: payload.supported_crops || centres[idx].supported_crops
      };
      saveCentres(centres);

      if (payload.slots && payload.slots.length > 0) {
        let allSlots = getStoredSlots().filter(s => s.centre_id !== id);
        const centreSlots = payload.slots.map(s => ({ ...s, id: "s-" + Math.random().toString(36).substring(7), centre_id: id }));
        saveSlots([...allSlots, ...centreSlots]);
      }

      return centres[idx];
    }
    throw new Error("Centre not found");
  },
  deleteCentre: async (id) => {
    await delay(500);
    let centres = getStoredCentres();
    centres = centres.filter(c => c.id !== id);
    saveCentres(centres);
    return { success: true };
  },
  getNotifications: async () => {
    return getStoredNotifications();
  },
  markNotificationsRead: async () => {
    const notifs = getStoredNotifications().map(n => ({ ...n, read: true }));
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
    const newCrop = { id: "cr-" + Math.random().toString(36).substring(7), name, minimum_support_price: msp || 0 };
    crops.push(newCrop);
    saveCrops(crops);
    return newCrop;
  },
  getFarmer: async (farmerId) => {
    await delay(300);
    return {
      id: farmerId,
      full_name: "Ramesh Kumar",
      mobile_number: "9876543210",
      district: "Guntur"
    };
  },
  getSlots: async (centreId, date) => {
    await delay(400);
    const slots = getStoredSlots().filter(s => s.centre_id === centreId);
    return slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
  },
  createBooking: async (payload) => {
    await delay(500);
    const newBooking = {
      booking: {
        id: "b-" + Math.random().toString(36).substring(7),
        farmer_id: payload.farmer_id,
        farmer_name: payload.farmer_name,
        centre_id: payload.centre_id,
        slot_id: payload.slot_id,
        crop_id: payload.crop_id,
        crop_name: payload.crop_name,
        estimated_quantity: payload.estimated_quantity,
        status: "BOOKED",
        date: new Date().toISOString().split('T')[0]
      },
      token: {
        id: "t-" + Math.random().toString(36).substring(7),
        token_number: "A" + Math.floor(1000 + Math.random() * 9000)
      }
    };
    const bookings = getStoredBookings();
    bookings.push(newBooking);
    saveBookings(bookings);
    return newBooking;
  },
  getAllBookings: async () => {
    await delay(300);
    return getStoredBookings();
  },
  getBooking: async (bookingId) => {
    await delay(200);
    const bookings = getStoredBookings();
    const b = bookings.find(x => x.booking.id === bookingId);
    if (b) return b.booking;
    // Fallback for older format
    return {
      id: bookingId,
      status: "BOOKED",
      estimated_quantity: 40,
      date: new Date().toISOString().split('T')[0]
    };
  },
  updateBookingStatus: async (bookingId, status) => {
    await delay(300);
    const bookings = getStoredBookings();
    const idx = bookings.findIndex(x => x.booking.id === bookingId);
    let updatedBooking = { id: bookingId, status };
    if (idx > -1) {
      bookings[idx].booking.status = status;
      updatedBooking = bookings[idx].booking;
      saveBookings(bookings);
    }
    return updatedBooking;
  },
  getQueueEntry: async (tokenId) => {
    await delay(400);
    return {
      queue_position: 14,
      status: "waiting",
      estimated_wait_time: 42
    };
  },
  getProcurement: async (bookingId) => {
    await delay(400);
    return {
      id: "p1",
      procurement_status: "QUALITY_CHECK",
      actual_quantity: 39.5,
      quality_grade: "A"
    };
  },
  getPayment: async (procurementId) => {
    await delay(400);
    return {
      id: "pay1",
      amount: 87018.5, // 39.5 * 2203
      payment_status: "PROCESSING",
      transaction_ref: "TXN-" + Math.random().toString(36).substring(7).toUpperCase()
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
      farmer_id: config.farmerId
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
  const remaining = Number(slot.capacity_quintals || 0) - Number(slot.booked_quintals || 0);

  let formattedDate = slot.date || "TBD";
  try {
    if (slot.date) {
      formattedDate = new Date(`${slot.date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
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