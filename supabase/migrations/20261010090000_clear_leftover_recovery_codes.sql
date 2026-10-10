-- Recovery codes must not outlive the authenticator they belong to.
--
-- Using one code removed the factor but left the other nine valid, and
-- turning two-step sign-in off left all ten. They stayed until the next
-- setup replaced them — harmless while there is no factor to remove, but a
-- set the reader thinks of as spent would still work against the next one if
-- generating its replacement ever failed.

-- Using any one code now spends the whole set. Same signature, so the
-- service_role-only grant carries over.
CREATE OR REPLACE FUNCTION public.consume_mfa_recovery_code(p_user_id uuid, p_code text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.mfa_recovery_codes
    WHERE user_id = p_user_id
      AND code_hash = public.hash_mfa_recovery_code(p_code)
  ) THEN
    RETURN false;
  END IF;

  DELETE FROM public.mfa_recovery_codes WHERE user_id = p_user_id;
  RETURN true;
END;
$$;


-- Called after turning two-step sign-in off. It only acts once the factor is
-- really gone, so a session holding just the password cannot use it to throw
-- away the owner's codes while their authenticator is still in place.
CREATE OR REPLACE FUNCTION public.clear_mfa_recovery_codes() RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  DELETE FROM public.mfa_recovery_codes
  WHERE user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1
      FROM auth.mfa_factors
      WHERE user_id = auth.uid()
        AND status = 'verified'
    )
$$;

REVOKE EXECUTE ON FUNCTION public.clear_mfa_recovery_codes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clear_mfa_recovery_codes() TO authenticated;
