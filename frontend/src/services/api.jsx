const API_URL = (
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

function normalizeKeys(data) {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    if (!item || typeof item !== "object") return item;
    const normalized = {};
    for (const key in item) {
      normalized[key.toLowerCase()] = item[key];
    }
    return normalized;
  });
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      `Cannot connect to the backend at ${API_URL}${path}. Start FastAPI and check the API URL.`,
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      body?.detail || `Backend request failed (${response.status})`;
    throw new Error(detail);
  }
  return body;
}

export const api = {
  getCentres: async () => {
    const response = await request("/centres");
    const data = Array.isArray(response)
      ? response
      : response?.data || response?.items || [];
    return normalizeKeys(data);
  },
  getCrops: async () => {
    const response = await request("/crops");
    const data = Array.isArray(response)
      ? response
      : response?.data || response?.items || [];
    return normalizeKeys(data);
  },
  getFarmer: (farmerId) => request(`/farmers/${farmerId}`),
  getSlots: async (centreId, date) => {
    const path = `/slots${
      centreId || date
        ? `?${[
            centreId ? `centre_id=${encodeURIComponent(centreId)}` : "",
            date ? `date=${encodeURIComponent(date)}` : "",
          ]
            .filter(Boolean)
            .join("&")}`
        : ""
    }`;
    const response = await request(path);
    const data = Array.isArray(response)
      ? response
      : response?.data || response?.items || [];
    return normalizeKeys(data);
  },
  createBooking: (payload) =>
    request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getBooking: (bookingId) => request(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, status) =>
    request(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getQueueEntry: (tokenId) => request(`/queue/token/${tokenId}`),
  getProcurement: (bookingId) => request(`/procurement/${bookingId}`),
  getPayment: (procurementId) => request(`/payment/${procurementId}`),
  health: () => request("/health"),
  sendOtp: async (mobile) => {
    return { success: true, message: "OTP sent successfully" };
  },
  verifyOtp: async (payload) => {
    if (payload.role === "admin") {
      return { success: true, farmer_id: null };
    }
    return {
      success: true,
      farmer_id: config.farmerId || "f3333333-3333-3333-3333-333333333333",
    };
  },
};

export const config = {
  apiUrl: API_URL,
  docsUrl: `${API_URL}/docs`,
  farmerId:
    (import.meta && import.meta.env && import.meta.env.VITE_FARMER_ID) ||
    "f3333333-3333-3333-3333-333333333333",
  defaultCropId:
    (import.meta && import.meta.env && import.meta.env.VITE_CROP_ID) || "",
};

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
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
    tone: remaining < 25 ? "amber" : "green",
    raw: slot,
  };
}