-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types for Status Workflow
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE token_status_enum AS ENUM ('generated', 'checked_in', 'processing', 'completed', 'expired');
CREATE TYPE quality_status_enum AS ENUM ('pending', 'grade_a', 'grade_b', 'grade_c', 'rejected');
CREATE TYPE procurement_status_enum AS ENUM ('weighed', 'inspected', 'accepted', 'rejected');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');

-- 1. USERS (Extends Supabase Auth or standard user table)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'centre_admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMERS
CREATE TABLE public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    aadhaar_ref TEXT UNIQUE NOT NULL,
    village TEXT NOT NULL,
    land_details JSONB DEFAULT '{}'::jsonb,
    kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'changes_requested', 'denied')),
    kyc_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CENTRES
CREATE TABLE public.centres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    pincode TEXT NOT NULL,
    daily_capacity NUMERIC(10,2) NOT NULL,
    remaining_capacity NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CROPS
CREATE TABLE public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    variety TEXT,
    minimum_support_price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CENTRE CAPACITY
CREATE TABLE public.centre_capacity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_capacity NUMERIC(10,2) NOT NULL,
    allocated_capacity NUMERIC(10,2) DEFAULT 0.00,
    UNIQUE(centre_id, crop_id, date)
);

-- 6. SLOTS
CREATE TABLE public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity_quintals NUMERIC(10,2) NOT NULL,
    booked_quintals NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOKINGS
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE RESTRICT,
    centre_id UUID REFERENCES public.centres(id) ON DELETE RESTRICT,
    slot_id UUID REFERENCES public.slots(id) ON DELETE RESTRICT,
    crop_id UUID REFERENCES public.crops(id) ON DELETE RESTRICT,
    estimated_quantity NUMERIC(10,2) NOT NULL CHECK (estimated_quantity > 0),
    status booking_status_enum DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TOKENS
CREATE TABLE public.tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    token_number TEXT UNIQUE NOT NULL,
    qr_data TEXT NOT NULL,
    token_status token_status_enum DEFAULT 'generated',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. QUEUE ENTRIES
CREATE TABLE public.queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID UNIQUE REFERENCES public.tokens(id) ON DELETE CASCADE,
    queue_position INT NOT NULL,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    estimated_turn TIMESTAMPTZ,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'completed', 'skipped'))
);

-- 10. PROCUREMENT RECORDS
CREATE TABLE public.procurement_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE RESTRICT,
    actual_weight NUMERIC(10,2) NOT NULL CHECK (actual_weight > 0),
    quality_status quality_status_enum DEFAULT 'pending',
    procurement_status procurement_status_enum DEFAULT 'weighed',
    bill_number TEXT UNIQUE NOT NULL,
    inspected_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENTS
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procurement_id UUID UNIQUE REFERENCES public.procurement_records(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_status payment_status_enum DEFAULT 'pending',
    transaction_ref TEXT UNIQUE,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- API Access Policies (Allows FastAPI to read/write without auth tokens for development)
CREATE POLICY "Public crops read" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Public centres read" ON public.centres FOR SELECT USING (true);
CREATE POLICY "Public slots read" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Public farmers read" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Public bookings insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public bookings read" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public bookings update" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Public tokens insert" ON public.tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Public tokens read" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "Public queue read" ON public.queue_entries FOR SELECT USING (true);
CREATE POLICY "Public procurement read" ON public.procurement_records FOR SELECT USING (true);
CREATE POLICY "Public payments read" ON public.payments FOR SELECT USING (true);

-- ==========================================
-- SEED DATA (Fixes the 404 Error & Empty Dropdowns)
-- ==========================================
TRUNCATE TABLE public.slots, public.crops, public.centres, public.farmers, public.users CASCADE;

-- 1. Insert Test User
INSERT INTO public.users (id, full_name, email, phone, role) 
VALUES ('u9999999-9999-9999-9999-999999999999', 'Demo Farmer', 'farmer@demo.com', '9876500000', 'farmer');

-- 2. Insert Farmer Profile (Uses the exact UUID your frontend is requesting)
INSERT INTO public.farmers (id, user_id, name, phone, aadhaar_ref, village, land_details)
VALUES (
    '12f3b7f6-5999-45e7-8811-3fd982a25345', 
    'u9999999-9999-9999-9999-999999999999', 
    'Demo Farmer', 
    '9876500000', 
    '[Aadhaar Redacted]', 
    'Demo Village',
    '{}'::jsonb
);

-- 3. Insert Active Centres
INSERT INTO public.centres (id, name, location, district, pincode, daily_capacity, remaining_capacity, is_active)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'APMC Mandi, Guntur', 'Guntur Yard', 'Guntur', '522002', 500.00, 500.00, true),
('c2222222-2222-2222-2222-222222222222', 'Krishi Bhavan, Tenali', 'Tenali Main', 'Guntur', '522201', 300.00, 300.00, true);

-- 4. Insert Crops
INSERT INTO public.crops (id, name, variety, minimum_support_price, is_active)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Paddy', 'Grade A', 2183.00, true),
('a2222222-2222-2222-2222-222222222222', 'Wheat', 'Standard', 2275.00, true);

-- 5. Insert Available Slots for Today
INSERT INTO public.slots (id, centre_id, date, start_time, end_time, capacity_quintals, booked_quintals)
VALUES 
('s1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE, '09:00:00', '11:00:00', 100.00, 20.00),
('s2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE, '11:00:00', '13:00:00', 100.00, 95.00);