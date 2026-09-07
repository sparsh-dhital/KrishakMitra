const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      `Cannot connect to the backend at ${API_URL}. Start FastAPI and check the API URL.`,
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail || `Request failed (${response.status})`;
    throw new Error(detail);
  }
  return body;
}

export const api = {
  getCentres: () => request("/centres"),
  getCrops: () => request("/crops"),
  getSlots: (centreId, date) =>
    request(
      `/slots${
        centreId || date
          ? `?${[
              centreId ? `centre_id=${encodeURIComponent(centreId)}` : "",
              date ? `date=${encodeURIComponent(date)}` : "",
            ]
              .filter(Boolean)
              .join("&")}`
          : ""
      }`,
    ),
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
};

export const config = {
  apiUrl: API_URL,
  docsUrl: `${API_URL}/docs`,
  farmerId: import.meta.env.VITE_FARMER_ID || "",
  defaultCropId: import.meta.env.VITE_CROP_ID || "",
};

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function toUiSlot(slot) {
  const remaining =
    Number(slot.capacity_quintals || 0) - Number(slot.booked_quintals || 0);
  return {
    id: slot.id,
    date: new Date(`${slot.date}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: `${slot.start_time} - ${slot.end_time}`,
    remaining,
    tone: remaining < 25 ? "amber" : "green",
    raw: slot,
  };
}
