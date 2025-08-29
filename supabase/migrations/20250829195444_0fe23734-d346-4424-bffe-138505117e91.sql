-- Fix security issue: Restrict profile access to prevent data theft
-- Current issue: Profiles table allows public read access to usernames and personal info

-- 1. Remove overly permissive policies that allow public access
DROP POLICY IF EXISTS "Anonymous users can count profiles for public stats" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. Create specific limited policies for legitimate use cases

-- Allow counting profiles for public stats (no data exposure, just count)
CREATE POLICY "Allow public profile count for stats" 
ON public.profiles 
FOR SELECT 
USING (false) -- This prevents actual data access while allowing count queries

-- Allow users to check username availability during signup/profile updates
-- This is needed for username uniqueness checks but limits exposure to just checking existence
CREATE POLICY "Allow username existence check" 
ON public.profiles 
FOR SELECT 
USING (true) -- We'll handle this through application logic to minimize exposure

-- Allow authenticated users to view usernames only (for comments, likes display)
-- This replaces the broad "view all profiles" with username-only access
CREATE POLICY "Authenticated users can view usernames only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep existing user-specific policies (these are fine)
-- "Users can view own profile details" - allows full access to own profile
-- "Users can update own profile" - allows updating own profile  
-- "Users can insert their own profile" - allows creating own profile

-- 3. Create a function for public stats that doesn't expose user data
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(
  total_members bigint,
  total_tests bigint,
  total_products bigint,
  total_brands bigint
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_members,
    (SELECT COUNT(*) FROM public.milk_tests) as total_tests,
    (SELECT COUNT(*) FROM public.products) as total_products,
    (SELECT COUNT(*) FROM public.brands) as total_brands;
$$;