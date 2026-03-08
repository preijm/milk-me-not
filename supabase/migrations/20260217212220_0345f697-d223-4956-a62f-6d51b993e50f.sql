-- Recreate profiles_public view WITHOUT security_invoker so all users can look up usernames
-- This is safe because the view only exposes id, username, and avatar_url (no PII)
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
  SELECT id, username, avatar_url
  FROM public.profiles;