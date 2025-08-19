-- Fix security issue: Restrict profiles table access to authenticated users only
-- Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.profiles;

-- Create new policy that only allows authenticated users to view profiles
-- Users can view all profiles when authenticated (for features like viewing other users' test results)
-- But no access for unauthenticated users to prevent data harvesting
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Ensure users can still view their own profiles specifically
CREATE POLICY "Users can view own profile details" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Note: Username display in public test results will continue to work via milk_tests_view
-- which already includes username information for public display of test results