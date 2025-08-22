-- Security Fix: Restrict public access to user activity data
-- This prevents anonymous users from viewing user comments and likes, protecting user privacy

-- Drop overly permissive policies that allow anyone to view user activity
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;

-- Create new policies that only allow authenticated users to view comments and likes
-- This maintains functionality for logged-in users while protecting privacy
CREATE POLICY "Authenticated users can view comments" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view likes" 
ON public.likes 
FOR SELECT 
TO authenticated
USING (true);