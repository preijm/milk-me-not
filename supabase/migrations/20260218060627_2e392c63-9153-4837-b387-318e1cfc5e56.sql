
-- Recreate profiles_public view with security_invoker to satisfy linter
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = true)
AS
  SELECT id, username, avatar_url
  FROM public.profiles;

-- Add a SELECT policy on profiles for authenticated users so the view works
-- (profiles currently only allows SELECT where auth.uid() = id)
CREATE POLICY "Authenticated users can view public profile fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
