-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to delete names" ON public.names;
DROP POLICY IF EXISTS "Allow authenticated users to update names" ON public.names;

-- Create admin-only policies for UPDATE and DELETE
CREATE POLICY "Admins can update names"
ON public.names
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete names"
ON public.names
FOR DELETE
USING (is_admin());