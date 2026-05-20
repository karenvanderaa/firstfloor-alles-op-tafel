-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Track Brevo sync status on registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS brevo_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brevo_last_error TEXT,
  ADD COLUMN IF NOT EXISTS brevo_attempts INTEGER NOT NULL DEFAULT 0;

-- Track Brevo sync status on subscribers
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS brevo_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS brevo_last_error TEXT,
  ADD COLUMN IF NOT EXISTS brevo_attempts INTEGER NOT NULL DEFAULT 0;

-- Allow admins to update subscribers (already covered) — also let edge function (service role) bypass RLS automatically
-- No extra policies needed: service_role bypasses RLS by default.