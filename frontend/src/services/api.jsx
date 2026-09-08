const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const api = {
  getCentres: async () => {
    await delay(500);
    return [
      { id: "c1", name: "Mangalagiri Procurement Centre", district: "Guntur", daily_capacity: 5000 },
      { id: "c2", name: "Tenali Market Yard", district: "Guntur", daily_capacity: 3500 },
      { id: "c3", name: "Amaravati Main Hub", district: "Palnadu", daily_capacity: 8000 }
    ];
  },
  getCrops: async () => {
    await delay(300);
    return [
      { id: "cr1", name: "Paddy (Grade A)", minimum_support_price: 2203 },
      { id: "cr2", name: "Cotton (Long Staple)", minimum_support_price: 7020 },
      { id: "cr3", name: "Maize", minimum_support_price: 2090 }
    ];
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
    await delay(600);
    return [
      { id: "s1", date: "2026-09-10", start_time: "09:00 AM", end_time: "09:30 AM", capacity_quintals: 20, booked_quintals: 8 },
      { id: "s2", date: "2026-09-10", start_time: "09:30 AM", end_time: "10:00 AM", capacity_quintals: 20, booked_quintals: 12 },
      { id: "s3", date: "2026-09-10", start_time: "10:30 AM", end_time: "11:00 AM", capacity_quintals: 20, booked_quintals: 2 },
      { id: "s4", date: "2026-09-10", start_time: "11:00 AM", end_time: "11:30 AM", capacity_quintals: 20, booked_quintals: 18 },
      { id: "s5", date: "2026-09-10", start_time: "11:30 AM", end_time: "12:00 PM", capacity_quintals: 20, booked_quintals: 20 }
    ];
  },
  createBooking: async (payload) => {
    await delay(1000);
    return {
      booking: {
        id: "b-" + Math.random().toString(36).substring(7),
        farmer_id: payload.farmer_id,
        centre_id: payload.centre_id,
        slot_id: payload.slot_id,
        crop_id: payload.crop_id,
        estimated_quantity: payload.estimated_quantity,
        status: "BOOKED",
        date: "2026-09-10"
      },
      token: {
        id: "t-" + Math.random().toString(36).substring(7),
        token_number: "A" + Math.floor(1000 + Math.random() * 9000)
      }
    };
  },
  getBooking: async (bookingId) => {
    await delay(400);
    return {
      id: bookingId,
      status: "BOOKED",
      estimated_quantity: 40,
      date: "2026-09-10"
    };
  },
  updateBookingStatus: async (bookingId, status) => {
    await delay(500);
    return { id: bookingId, status };
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