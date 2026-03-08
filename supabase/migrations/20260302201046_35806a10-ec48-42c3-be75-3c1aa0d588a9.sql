
-- Recreate profiles_public view WITHOUT security_invoker so it can read other users' public info
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
  SELECT id, username, avatar_url
  FROM public.profiles;

-- Grant access
GRANT SELECT ON public.profiles_public TO anon, authenticated;
