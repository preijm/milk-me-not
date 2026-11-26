-- At most five wrong recovery codes per account per rolling hour.
--
-- A code is 48 random bits and the caller already needed the password, so
-- guessing was never practical. This closes the online-guessing gap anyway:
-- with the limit, someone holding the password gets about 44,000 guesses a
-- year against ten live codes, odds of roughly 1 in 600 billion. Five is room
-- for typos off paper; an hour is short enough that the real owner who
-- fumbles is not locked out for the day.
--
-- Why not the check-rate-limit Edge Function? Its SQL half (check_rate_limit,
-- a table behind it) was never created in any migration or in production, so
-- that function has always failed open. Creating it under that name would
-- quietly switch on login, signup and password-reset limits too. It also
-- counts every call, and only failures should count here. So this is its own
-- small table, and the check, the code test and the bookkeeping happen in one
-- function under one lock, which two requests in parallel cannot slip past.

CREATE TABLE IF NOT EXISTS public.mfa_recovery_failures (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  failed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mfa_recovery_failures_user_time
  ON public.mfa_recovery_failures (user_id, failed_at);

-- Only the definer function below touches it. RLS on with no policies, and no
-- grants beyond service_role, which the Edge Function uses.
ALTER TABLE public.mfa_recovery_failures ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mfa_recovery_failures FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.mfa_recovery_failures TO service_role;


-- 'ok'      the code was right; the whole set is spent (consume's rule)
-- 'invalid' wrong or already used; one more failure is counted
-- 'limited' five failures in the last hour; the code is not even looked at,
--           so a limited caller learns nothing, not even from a right guess
CREATE OR REPLACE FUNCTION public.redeem_mfa_recovery_code(p_user_id uuid, p_code text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  max_failures constant int := 5;
  window_length constant interval := interval '1 hour';
BEGIN
  -- One redemption per account at a time.
  PERFORM pg_advisory_xact_lock(hashtextextended('mfa_recover:' || p_user_id::text, 0));

  -- Old rows serve no purpose; clearing them here means no cron job.
  DELETE FROM public.mfa_recovery_failures
  WHERE user_id = p_user_id AND failed_at < now() - window_length;

  IF (SELECT count(*) FROM public.mfa_recovery_failures WHERE user_id = p_user_id) >= max_failures THEN
    RETURN 'limited';
  END IF;

  IF public.consume_mfa_recovery_code(p_user_id, p_code) THEN
    DELETE FROM public.mfa_recovery_failures WHERE user_id = p_user_id;
    RETURN 'ok';
  END IF;

  INSERT INTO public.mfa_recovery_failures (user_id) VALUES (p_user_id);
  RETURN 'invalid';
END;
$$;

-- Service role only: anyone else could burn another account's attempts, or
-- its codes, by passing its user id.
REVOKE EXECUTE ON FUNCTION public.redeem_mfa_recovery_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_mfa_recovery_code(uuid, text) TO service_role;
