
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('student', 'club_admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- RLS: authenticated users can insert their own role
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update RLS policies on clubs to use has_role
DROP POLICY IF EXISTS "Admins can insert clubs" ON public.clubs;
CREATE POLICY "Admins can insert clubs" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'club_admin'));

DROP POLICY IF EXISTS "Admins can update clubs" ON public.clubs;
CREATE POLICY "Admins can update clubs" ON public.clubs
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'club_admin'));

-- Update RLS policies on events
DROP POLICY IF EXISTS "Admins can create events" ON public.events;
CREATE POLICY "Admins can create events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'club_admin'));

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'club_admin'));

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'club_admin'));

-- Update RLS policies on announcements
DROP POLICY IF EXISTS "Admins can create announcements" ON public.announcements;
CREATE POLICY "Admins can create announcements" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'club_admin'));

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
CREATE POLICY "Admins can delete announcements" ON public.announcements
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'club_admin'));

-- Update RLS policies on club_members
DROP POLICY IF EXISTS "Admins can update members" ON public.club_members;
CREATE POLICY "Admins can update members" ON public.club_members
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'club_admin'));

-- Update RLS policies on payments
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'club_admin'));

DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'club_admin'));
