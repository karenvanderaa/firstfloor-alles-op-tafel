ALTER TABLE public.whitepaper_downloads
  ADD COLUMN IF NOT EXISTS whitepaper text NOT NULL DEFAULT 'ai-in-hr';