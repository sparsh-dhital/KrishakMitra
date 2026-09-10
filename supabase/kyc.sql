-- Run this migration for existing Supabase projects.
ALTER TABLE public.farmers
  ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS kyc_note TEXT DEFAULT '';

UPDATE public.farmers SET kyc_status = 'pending' WHERE kyc_status IS NULL;