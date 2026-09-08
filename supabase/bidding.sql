-- Shared private-market bidding tables.
-- Apply this file in the Supabase SQL editor before using two separate devices.

CREATE TABLE IF NOT EXISTS public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id TEXT NOT NULL,
    crop_id TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price > 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'awarded', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    awarded_at TIMESTAMPTZ
);

ALTER TABLE public.auctions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    buyer_id TEXT NOT NULL,
    offered_price NUMERIC(12,2) NOT NULL CHECK (offered_price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auction_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id TEXT NOT NULL,
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
    bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auctions_status_created_idx ON public.auctions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS auctions_farmer_idx ON public.auctions(farmer_id);
CREATE INDEX IF NOT EXISTS bids_auction_price_idx ON public.bids(auction_id, offered_price DESC);
CREATE INDEX IF NOT EXISTS auction_notifications_farmer_idx ON public.auction_notifications(farmer_id, created_at DESC);

ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public auction read" ON public.auctions;
DROP POLICY IF EXISTS "Public auction insert" ON public.auctions;
DROP POLICY IF EXISTS "Public auction update" ON public.auctions;
DROP POLICY IF EXISTS "Public bid read" ON public.bids;
DROP POLICY IF EXISTS "Public bid insert" ON public.bids;
DROP POLICY IF EXISTS "Public notification read" ON public.auction_notifications;
DROP POLICY IF EXISTS "Public notification insert" ON public.auction_notifications;

CREATE POLICY "Public auction read" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Public auction insert" ON public.auctions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public auction update" ON public.auctions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public bid read" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Public bid insert" ON public.bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Public notification read" ON public.auction_notifications FOR SELECT USING (true);
CREATE POLICY "Public notification insert" ON public.auction_notifications FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_notifications;
