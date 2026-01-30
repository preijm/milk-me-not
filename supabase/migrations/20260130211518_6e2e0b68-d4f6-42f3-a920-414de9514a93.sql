-- Drop the overly permissive policy that allows anyone to read all profiles
DROP POLICY IF EXISTS "Users can view all profiles for username lookup" ON public.profiles;

-- The existing "Users can view own profile" policy (auth.uid() = id) remains
-- The profiles_public view is used for safe public username lookups
-- Security definer functions (get_all_milk_tests, etc.) handle cross-user access internally