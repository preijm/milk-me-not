-- Drop the overly permissive policy that allows anonymous flavor insertion
DROP POLICY IF EXISTS "All users can add flavors" ON public.flavors;

-- Create a policy that requires authentication for flavor insertion
CREATE POLICY "Authenticated users can add flavors" 
ON public.flavors 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);