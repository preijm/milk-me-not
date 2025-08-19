-- Fix security issue: Restrict milk_tests table access to authenticated users only
-- Remove the overly permissive public access policy that allows anyone to view all user reviews
DROP POLICY IF EXISTS "Anyone can view all milk tests" ON public.milk_tests;

-- Create new policy that only allows authenticated users to view milk tests
-- This prevents anonymous users from harvesting user behavior data and review patterns
CREATE POLICY "Authenticated users can view milk tests" 
ON public.milk_tests 
FOR SELECT 
TO authenticated
USING (true);

-- Note: milk_tests_view will automatically inherit this security restriction
-- since views inherit RLS policies from their underlying tables