ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_email_thema_unique UNIQUE (email, thema);