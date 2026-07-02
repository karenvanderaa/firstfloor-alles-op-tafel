GRANT INSERT ON public.whitepaper_downloads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whitepaper_downloads TO authenticated;
GRANT ALL ON public.whitepaper_downloads TO service_role;