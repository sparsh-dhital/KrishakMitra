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
    land_details JSONB DEFAULT '{}'::jsonb, -- Store survey numbers, area in acres, etc.
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
    daily_capacity NUMERIC(10,2) NOT NULL, -- in quintals
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
    minimum_support_price NUMERIC(10,2) NOT NULL, -- MSP per quintal
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

-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
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

-- EXAMPLE PUBLIC READ POLICIES (Adjust as needed)
CREATE POLICY "Public crops read policy" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Public centres read policy" ON public.centres FOR SELECT USING (true);
CREATE POLICY "Public slots read policy" ON public.slots FOR SELECT USING (true);