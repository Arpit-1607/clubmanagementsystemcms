
-- Fix remaining anonymous SELECT policies to require authenticated
DROP POLICY IF EXISTS "Anyone can read announcements" ON public.announcements;
CREATE POLICY "Authenticated can read announcements" ON public.announcements
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read club members" ON public.club_members;
CREATE POLICY "Authenticated can read club members" ON public.club_members
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read clubs" ON public.clubs;
CREATE POLICY "Authenticated can read clubs" ON public.clubs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read registrations" ON public.event_registrations;
CREATE POLICY "Authenticated can read registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
CREATE POLICY "Authenticated can read events" ON public.events
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Authenticated can read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
