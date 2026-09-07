// Frontend fixtures mirror the Supabase table and foreign-key relationships.
export const schemaData = {
  users: [
    {
      id: "user-001",
      auth_user_id: "auth-001",
      full_name: "Arjun Singh",
      email: "arjun@example.com",
      phone: "+91 9876543242",
      role: "farmer",
    },
  ],
  farmers: [
    {
      id: "farmer-001",
      user_id: "user-001",
      name: "Arjun Singh",
      phone: "+91 9876543242",
      aadhaar_ref: "XXXX-XXXX-2048",
      village: "Kishangarh",
      land_details: { acres: 12 },
    },
  ],
  centres: [
    {
      id: "centre-001",
      name: "Rajasthan Mandi Centre",
      location: "Ajmer Road",
      district: "Jaipur",
      pincode: "302019",
      daily_capacity: 500,
      is_active: true,
    },
  ],
  crops: [
    {
      id: "crop-001",
      name: "Wheat",
      variety: "Lokwan",
      minimum_support_price: 2275,
      is_active: true,
    },
    {
      id: "crop-002",
      name: "Mustard",
      variety: "Pusa Bold",
      minimum_support_price: 5650,
      is_active: true,
    },
  ],
  centre_capacity: [
    {
      id: "capacity-001",
      centre_id: "centre-001",
      crop_id: "crop-001",
      date: "2024-06-18",
      total_capacity: 500,
      allocated_capacity: 342,
    },
  ],
  slots: [
    {
      id: "slot-001",
      centre_id: "centre-001",
      date: "2024-06-18",
      start_time: "08:00",
      end_time: "10:00",
      capacity_quintals: 150,
      booked_quintals: 108,
    },
    {
      id: "slot-002",
      centre_id: "centre-001",
      date: "2024-06-18",
      start_time: "10:00",
      end_time: "12:00",
      capacity_quintals: 150,
      booked_quintals: 132,
    },
    {
      id: "slot-003",
      centre_id: "centre-001",
      date: "2024-06-19",
      start_time: "08:00",
      end_time: "10:00",
      capacity_quintals: 150,
      booked_quintals: 83,
    },
  ],
  bookings: [
    {
      id: "booking-001",
      farmer_id: "farmer-001",
      centre_id: "centre-001",
      slot_id: "slot-001",
      crop_id: "crop-001",
      estimated_quantity: 40,
      status: "BOOKED",
    },
  ],
  tokens: [
    {
      id: "token-001",
      booking_id: "booking-001",
      token_number: "TK1045",
      qr_data: "smart-mandi://token/TK1045",
      token_status: "ACTIVE",
      issued_at: "2024-06-17T09:12:00Z",
    },
  ],
  queue_entries: [
    {
      id: "queue-001",
      token_id: "token-001",
      queue_position: 5,
      check_in_time: null,
      estimated_turn: "10:45",
      status: "WAITING",
    },
  ],
  procurement_records: [
    {
      id: "procurement-001",
      booking_id: "booking-001",
      actual_weight: null,
      quality_status: "PENDING",
      procurement_status: "PENDING",
      bill_number: null,
      inspected_by: null,
    },
  ],
  payments: [
    {
      id: "payment-001",
      procurement_id: "procurement-001",
      amount: null,
      payment_status: "PENDING",
      transaction_ref: null,
      payment_date: null,
    },
  ],
  notifications: [
    {
      id: "notification-001",
      user_id: "user-001",
      title: "Slot booked successfully",
      message: "Your token TK1045 is ready.",
      is_read: false,
    },
  ],
};

const centre = schemaData.centres[0];
const crop = schemaData.crops[0];
const booking = schemaData.bookings[0];
const token = schemaData.tokens[0];

export const slots = schemaData.slots.map((slot) => ({
  id: slot.id,
  date: new Date(`${slot.date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }),
  time: `${slot.start_time} - ${slot.end_time}`,
  remaining: slot.capacity_quintals - slot.booked_quintals,
  tone: slot.capacity_quintals - slot.booked_quintals < 25 ? "amber" : "green",
}));

export const queue = [
  {
    token: "TK1041",
    name: "Ramesh Kumar",
    crop: "Wheat",
    status: "Weighing",
    weight: "42 q",
  },
  {
    token: "TK1042",
    name: "Sita Devi",
    crop: "Wheat",
    status: "Quality check",
    weight: "35 q",
  },
  {
    token: "TK1043",
    name: "Mohan Lal",
    crop: "Mustard",
    status: "Waiting",
    weight: "28 q",
  },
  {
    token: token.token_number,
    name: schemaData.farmers[0].name,
    crop: crop.name,
    status: "Waiting",
    weight: `${booking.estimated_quantity} q`,
  },
];

export const dashboard = {
  centre,
  crop,
  booking,
  token,
  capacity: schemaData.centre_capacity[0],
  farmer: schemaData.farmers[0],
};
