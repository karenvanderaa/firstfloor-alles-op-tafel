
CREATE OR REPLACE FUNCTION public.get_seats_taken(_thema text, _moment text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.registrations
  WHERE thema = _thema
    AND moment = _moment
    AND status <> 'geannuleerd';
$$;

REVOKE ALL ON FUNCTION public.get_seats_taken(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_seats_taken(text, text) TO anon, authenticated;
