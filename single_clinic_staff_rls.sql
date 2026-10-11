-- Idempotent RLS Policy Setup for profiles management by admin users

-- 1. Ensure custom_title column exists in public.profiles to store detailed roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_title TEXT;

-- 2. Drop existing insert policies for profiles
DROP POLICY IF EXISTS "Allow authenticated insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to insert profiles" ON public.profiles;

-- Recreate: Users can insert their own profile details
CREATE POLICY "Allow authenticated insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Recreate: Admin users can insert any profiles (e.g. adding new staff members)
CREATE POLICY "Allow admin to insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

-- 3. Drop existing delete policies for profiles
DROP POLICY IF EXISTS "Allow admin to delete profiles" ON public.profiles;

-- Recreate: Admin users can delete profiles (e.g. deleting staff members)
CREATE POLICY "Allow admin to delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');
