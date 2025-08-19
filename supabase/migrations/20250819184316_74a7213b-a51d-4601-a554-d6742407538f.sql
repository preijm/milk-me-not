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

-- Also ensure milk_tests_view is protected since it contains the same sensitive data
-- Enable RLS on the view to inherit table-level security
ALTER TABLE public.milk_tests_view ENABLE ROW LEVEL SECURITY;

-- Create policy for milk_tests_view to match the table policy
CREATE POLICY "Authenticated users can view milk tests view" 
ON public.milk_tests_view 
FOR SELECT 
TO authenticated
USING (true);