-- Recovery code hashes that are useless without the database's own key.
--
-- Until now a code was stored as a plain sha256 of 12 hex digits. That is 48
-- bits, and one GPU sweep of 2^48 inverts every row in a leaked copy of
-- mfa_recovery_codes in hours. That copy is not hypothetical: on 26 Nov 2026
-- a restore rehearsal found the table in the weekly community dump synced to
-- OneDrive (excluded since #364, but the full dump on the laptop still holds
-- it).
--
-- Now a code is an HMAC-SHA256 keyed with a pepper held in Supabase Vault.
-- What a dump carries of Vault, checked against the local stack:
--   * `supabase db dump` (which the backup script uses) leaves the vault
--     schema out entirely, data-only or not;
--   * a raw `pg_dump -t vault.secrets` gives only ciphertext, and the key that
--     decrypts it is read by pgsodium's getkey script from the server's
--     filesystem, never stored in the database.
-- So a leaked table plus a leaked dump is still 2^48 HMACs under a 256-bit key
-- nobody has: no offline attack.
--
-- The pepper is generated here, inside the database, so it never passes
-- through git, a terminal or a person. Each database (production, every local
-- stack) gets its own. A database restored from a dump into a new project has
-- a different Vault key and so no readable pepper: every recovery code is dead
-- after such a restore and people make new ones. That is intended.
--
-- Old hashes cannot be re-keyed (the codes themselves are not stored), and
-- they are not accepted until spent: the rows that already sat in a synced
-- dump are exactly the ones this protects against. Every existing set is
-- deleted. Settings then shows "No recovery codes yet" with a button to make
-- new ones; the authenticator itself is untouched.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'mfa_recovery_code_pepper') THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'mfa_recovery_code_pepper',
      'HMAC key for public.mfa_recovery_codes. Losing or changing it invalidates every recovery code.'
    );
  END IF;
END;
$$;


-- Same name and signature, so the three callers pick it up unchanged. STABLE
-- now, not IMMUTABLE, because it reads Vault. It runs inside the SECURITY
-- DEFINER callers, which is what lets it read vault.decrypted_secrets; nobody
-- else may call it, or it would be an oracle for the pepper.
CREATE OR REPLACE FUNCTION public.hash_mfa_recovery_code(p_code text) RETURNS text
    LANGUAGE plpgsql STABLE
    SET search_path TO 'public'
    AS $$
DECLARE
  pepper text;
BEGIN
  SELECT decrypted_secret INTO pepper
  FROM vault.decrypted_secrets
  WHERE name = 'mfa_recovery_code_pepper';

  -- Fail loudly: a NULL key would hash every code to NULL and quietly turn
  -- recovery off.
  IF pepper IS NULL THEN
    RAISE EXCEPTION 'mfa_recovery_code_pepper is missing from Vault';
  END IF;

  RETURN encode(
    extensions.hmac(
      convert_to(regexp_replace(lower(p_code), '[^0-9a-f]', '', 'g'), 'UTF8'),
      convert_to(pepper, 'UTF8'),
      'sha256'
    ),
    'hex'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.hash_mfa_recovery_code(text) FROM PUBLIC, anon, authenticated;


-- Unchanged in behaviour (any one code spends the whole set); the hash is now
-- worked out once instead of once per row.
CREATE OR REPLACE FUNCTION public.consume_mfa_recovery_code(p_user_id uuid, p_code text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  h text := public.hash_mfa_recovery_code(p_code);
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.mfa_recovery_codes
    WHERE user_id = p_user_id
      AND code_hash = h
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.mfa_recovery_codes WHERE user_id = p_user_id;
  RETURN true;
END;
$$;


-- Every hash written before this migration is a plain sha256: drop them all.
DELETE FROM public.mfa_recovery_codes;
