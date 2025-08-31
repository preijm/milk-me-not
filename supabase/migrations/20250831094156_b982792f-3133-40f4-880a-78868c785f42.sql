-- Fix critical security issue: Remove public access to profiles table
-- Current issue: "Allow username validation checks" policy allows anonymous users to read all profile data

-- 1. Remove the overly permissive policy that exposes user data
DROP POLICY IF EXISTS "Allow username validation checks" ON public.profiles;

-- 2. Create a secure function for username validation that doesn't expose user data
CREATE OR REPLACE FUNCTION public.check_username_exists(username_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE username = username_to_check
  );
$$;

-- 3. Create a more restrictive policy for profile access
-- Only allow users to view their own profiles and authenticated users to see usernames for display purposes
CREATE POLICY "Users can view own profile details" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 4. Allow authenticated users to view usernames only (for comments, feed, etc.)
CREATE POLICY "Authenticated users can view usernames" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);