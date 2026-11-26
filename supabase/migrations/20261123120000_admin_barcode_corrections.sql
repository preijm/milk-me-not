-- Let an admin see and correct which product a barcode belongs to.
--
-- product_barcodes is first write wins on purpose: remember_product_barcode
-- ignores a barcode it already knows, so a later scanner cannot quietly move
-- one. Its own comment says correcting a wrong one "is an admin job", and
-- until now there was no such job: a barcode written against the wrong
-- product sent every later scan of that carton to the wrong page, and the
-- only fix was SQL in the dashboard.
--
-- Three functions, all admin-only through is_admin() — so they inherit the
-- two-step sign-in rule from 20261006210000 like every other admin path:
--
--   admin_list_product_barcodes   the barcodes pointing at one product
--   admin_set_product_barcode     point a barcode at a product, new or moved
--   admin_delete_product_barcode  forget a barcode, so the next scan asks
--
-- The table keeps its REVOKE from 20260820120000: still no direct access for
-- anyone, admins included. Every change is written to security_log with the
-- product it pointed at before, so a mistaken correction can be undone from
-- the log.

CREATE OR REPLACE FUNCTION public.admin_list_product_barcodes(_product_id uuid)
RETURNS TABLE (barcode text, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an admin can see barcodes' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT pb.barcode, pb.created_at
    FROM public.product_barcodes pb
    WHERE pb.product_id = _product_id
    ORDER BY pb.created_at;
END;
$$;

/**
 * Point a barcode at a product, whether or not it pointed somewhere already.
 *
 * Returns the product it pointed at before, or null when it was new. The
 * caller asks before moving a barcode that belongs elsewhere — this function
 * does not, because by the time it is called the admin has said yes.
 *
 * Unlike remember_product_barcode, a malformed barcode is an error rather than
 * a silent no-op: an admin typed it, and should hear that it was not saved.
 */
CREATE OR REPLACE FUNCTION public.admin_set_product_barcode(_barcode text, _product_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an admin can change barcodes' USING ERRCODE = '42501';
  END IF;

  IF _barcode IS NULL OR _barcode !~ '^[0-9]{8,14}$' THEN
    RAISE EXCEPTION 'A barcode is 8 to 14 digits' USING ERRCODE = '22023';
  END IF;

  SELECT pb.product_id INTO previous
  FROM public.product_barcodes pb
  WHERE pb.barcode = _barcode
  FOR UPDATE;

  INSERT INTO public.product_barcodes (barcode, product_id, created_by)
  VALUES (_barcode, _product_id, auth.uid())
  ON CONFLICT (barcode) DO UPDATE
    SET product_id = EXCLUDED.product_id,
        created_at = now(),
        created_by = EXCLUDED.created_by;

  PERFORM public.log_security_event(
    'admin_barcode_set',
    jsonb_build_object(
      'barcode', _barcode,
      'product_id', _product_id,
      'previous_product_id', previous
    )
  );

  RETURN previous;
END;
$$;

/**
 * Forget a barcode. The next person to scan that carton is asked again.
 *
 * Returns whether there was anything to forget.
 */
CREATE OR REPLACE FUNCTION public.admin_delete_product_barcode(_barcode text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an admin can change barcodes' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.product_barcodes pb
  WHERE pb.barcode = _barcode
  RETURNING pb.product_id INTO previous;

  IF previous IS NULL THEN
    RETURN false;
  END IF;

  PERFORM public.log_security_event(
    'admin_barcode_deleted',
    jsonb_build_object('barcode', _barcode, 'previous_product_id', previous)
  );

  RETURN true;
END;
$$;

-- REVOKE FROM PUBLIC is not enough on its own here. The baseline's default
-- privileges grant EXECUTE on every new function in public to anon and
-- authenticated *by name*, and a revoke from PUBLIC leaves a named grant
-- standing. is_admin() is the real control, but a signed-out caller has no
-- business reaching these at all.
REVOKE ALL ON FUNCTION public.admin_list_product_barcodes(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_product_barcode(text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_delete_product_barcode(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_product_barcodes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_product_barcode(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_product_barcode(text) TO authenticated;

-- The same gap, in the migration that created the table. It revoked from
-- PUBLIC and granted remember_product_barcode to authenticated "only" — but
-- the default privilege had already granted anon by name, and production
-- answers true to has_function_privilege('anon', ...). Harmless, because the
-- function returns early with no auth.uid(), but the grant should say what
-- its comment and rememberBarcode.ts claim it says.
REVOKE EXECUTE ON FUNCTION public.remember_product_barcode(text, uuid) FROM anon;
