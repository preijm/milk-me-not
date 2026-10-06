-- An admin who has turned on two-step sign-in must have used it to act as one.
--
-- Two-step sign-in is optional for admins, and the code prompt in the app
-- (TwoFactorGate) only stops the website: a session that signed in with the
-- password alone is "aal1", and every admin policy would still have accepted
-- it at the API. So someone holding an admin's password could skip the prompt
-- and call PostgREST directly.
--
-- Every admin policy — brands, products, shops, countries, user_roles,
-- security_log and the rest — goes through is_admin(), so changing it here
-- covers them all, and any policy written later the same way. No policy calls
-- has_role directly.
--
-- Still optional: an admin with no verified factor passes exactly as before.
-- Only once a factor is verified does the session have to be aal2.
--
-- Also used by useAdminCheck through rpc('is_admin'). An aal1 session with a
-- factor now reads as "not admin", which is true, and never visible: the gate
-- holds the app back until the code is given.
--
-- CREATE OR REPLACE keeps the owner and the existing grants.

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    AND (
      coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      OR NOT EXISTS (
        SELECT 1
        FROM auth.mfa_factors
        WHERE user_id = auth.uid()
          AND status = 'verified'
      )
    )
$$;
