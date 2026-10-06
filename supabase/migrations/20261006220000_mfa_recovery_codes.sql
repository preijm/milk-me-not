-- Recovery codes for two-step sign-in.
--
-- Supabase has no backup codes, so a lost phone meant someone with dashboard
-- access removing the factor by hand. These are the usual ten one-time codes,
-- shown once when two-step sign-in is turned on.
--
-- What a code does is remove the authenticator, not stand in for it: only
-- Supabase can mark a session aal2, so a custom check cannot finish a sign-in
-- the way the 6-digit code does. The mfa-recover edge function checks the code
-- here, then deletes the factor through the admin API. The reader is left
-- signed in with their password and sets two-step sign-in up again.
--
-- Only hashes are stored. The codes are 48 random bits each, so a plain
-- sha256 is enough; a slow hash earns its cost on passwords people choose,
-- not on these.

CREATE TABLE IF NOT EXISTS public.mfa_recovery_codes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mfa_recovery_codes_user_id_idx
  ON public.mfa_recovery_codes (user_id);

ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

-- No direct access for anyone: the three functions below are the only way in,
-- so not even its owner can read back the hashes through the API.
REVOKE ALL ON public.mfa_recovery_codes FROM anon, authenticated;


-- A code is normalised before hashing, so "A1B2 C3D4-E5F6" typed off paper
-- matches what was generated.
CREATE OR REPLACE FUNCTION public.hash_mfa_recovery_code(p_code text) RETURNS text
    LANGUAGE sql IMMUTABLE
    SET search_path TO 'public'
    AS $$
  SELECT encode(sha256(convert_to(regexp_replace(lower(p_code), '[^0-9a-f]', '', 'g'), 'UTF8')), 'hex')
$$;

REVOKE EXECUTE ON FUNCTION public.hash_mfa_recovery_code(text) FROM PUBLIC, anon, authenticated;


-- Ten new codes, replacing any earlier set, returned in plain text this once.
-- Only from a session that has given its 6-digit code: otherwise a stolen
-- password alone could mint codes and then use one to strip the factor.
CREATE OR REPLACE FUNCTION public.generate_mfa_recovery_codes() RETURNS text[]
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  codes text[] := '{}';
  raw text;
BEGIN
  IF auth.uid() IS NULL OR coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' THEN
    RAISE EXCEPTION 'Two-step sign-in must be completed first' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.mfa_recovery_codes WHERE user_id = auth.uid();

  FOR i IN 1..10 LOOP
    -- The first 12 hex digits of a v4 uuid are all random; the version and
    -- variant bits come after them.
    raw := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    codes := codes || (substr(raw, 1, 4) || '-' || substr(raw, 5, 4) || '-' || substr(raw, 9, 4));
    INSERT INTO public.mfa_recovery_codes (user_id, code_hash)
    VALUES (auth.uid(), public.hash_mfa_recovery_code(raw));
  END LOOP;

  RETURN codes;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_mfa_recovery_codes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_mfa_recovery_codes() TO authenticated;


CREATE OR REPLACE FUNCTION public.mfa_recovery_codes_remaining() RETURNS integer
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT count(*)::integer FROM public.mfa_recovery_codes WHERE user_id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.mfa_recovery_codes_remaining() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mfa_recovery_codes_remaining() TO authenticated;


-- Uses a code up. Service role only: the edge function calls it, and it is
-- the edge function that then removes the factor, which nothing in the
-- browser is allowed to do. True when the code was valid, and it is gone.
CREATE OR REPLACE FUNCTION public.consume_mfa_recovery_code(p_user_id uuid, p_code text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  WITH used AS (
    DELETE FROM public.mfa_recovery_codes
    WHERE user_id = p_user_id
      AND code_hash = public.hash_mfa_recovery_code(p_code)
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM used)
$$;

REVOKE EXECUTE ON FUNCTION public.consume_mfa_recovery_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_mfa_recovery_code(uuid, text) TO service_role;
