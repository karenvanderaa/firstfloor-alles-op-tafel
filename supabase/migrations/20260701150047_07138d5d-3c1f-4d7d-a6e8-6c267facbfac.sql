
CREATE TABLE public.whitepaper_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  naam TEXT NOT NULL,
  email TEXT NOT NULL,
  toestemming BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  brevo_synced_at TIMESTAMPTZ,
  brevo_last_error TEXT,
  brevo_attempts INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT toestemming_true CHECK (toestemming = true)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whitepaper_downloads TO authenticated;
GRANT INSERT ON public.whitepaper_downloads TO anon;
GRANT ALL ON public.whitepaper_downloads TO service_role;

ALTER TABLE public.whitepaper_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can download whitepaper"
  ON public.whitepaper_downloads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all whitepaper downloads"
  ON public.whitepaper_downloads FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update whitepaper downloads"
  ON public.whitepaper_downloads FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete whitepaper downloads"
  ON public.whitepaper_downloads FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER whitepaper_downloads_sync_to_brevo
AFTER INSERT ON public.whitepaper_downloads
FOR EACH ROW EXECUTE FUNCTION public.trigger_sync_to_brevo();

-- Allow admins to read/manage whitepaper files in storage; service role bypasses
CREATE POLICY "Admins can manage whitepaper storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'whitepapers' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'whitepapers' AND has_role(auth.uid(), 'admin'::app_role));
