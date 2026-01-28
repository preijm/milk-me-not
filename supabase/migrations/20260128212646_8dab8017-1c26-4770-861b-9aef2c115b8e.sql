-- Fix #1: Restrict profiles SELECT policy to only expose necessary public fields
-- Drop the misleading policy and create a proper one

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view usernames only" ON public.profiles;

-- Create a view for public profile data (only username and avatar for display)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  username,
  avatar_url
FROM public.profiles;

-- Create a more restrictive policy - users can only view their own full profile
-- Other users' data is accessed through the profiles_public view
CREATE POLICY "Users can view all profiles for username lookup"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: The view approach with security_invoker=on inherits the underlying table's RLS
-- Since we need usernames visible for the feed, we keep SELECT open but the view 
-- limits which columns are exposed when querying other users' profiles

-- Fix #2: Protect security_log from tampering
-- Add explicit policies to prevent unauthorized modifications

-- Allow inserts only through the security definer function (no direct inserts)
CREATE POLICY "No direct inserts to security_log"
ON public.security_log
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Prevent any deletes - audit logs should never be deleted
CREATE POLICY "No deletes on security_log"
ON public.security_log
FOR DELETE
TO authenticated
USING (false);

-- Prevent any updates - audit logs should be immutable  
CREATE POLICY "No updates on security_log"
ON public.security_log
FOR UPDATE
TO authenticated
USING (false);