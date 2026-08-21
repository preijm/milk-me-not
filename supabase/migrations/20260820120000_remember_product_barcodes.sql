-- Remember which barcode belongs to which product.
--
-- Scanning could only ever match on brand, because nothing recorded a barcode
-- anywhere: scanning any Alpro carton returned every Alpro product on the
-- board and asked the reader to pick. This gives a scan somewhere to look, and
-- somewhere to record what it learns, so the second person to scan a carton
-- goes straight to it.
--
-- A separate table rather than a column on products: products carries its own
-- RLS for registration and admin editing, and a barcode is a fact about a
-- package rather than about the product record. Keeping it apart means adding
-- this cannot loosen anything already there.

CREATE TABLE IF NOT EXISTS public.product_barcodes (
  barcode text PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS product_barcodes_product_id_idx
  ON public.product_barcodes (product_id);

ALTER TABLE public.product_barcodes ENABLE ROW LEVEL SECURITY;

-- No direct table access: everything goes through the two functions below, so
-- the write path cannot be used to point an existing barcode somewhere else.
REVOKE ALL ON public.product_barcodes FROM anon, authenticated;

/**
 * Resolve a scanned barcode to a product, or nothing.
 */
CREATE OR REPLACE FUNCTION public.get_product_by_barcode(_barcode text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT product_id FROM public.product_barcodes WHERE barcode = _barcode
$$;

/**
 * Record a barcode against a product, once.
 *
 * Deliberately does nothing when the barcode is already known: the first
 * person to scan a carton and pick its product sets it, and later scanners
 * cannot silently move it. Correcting a wrong one is an admin job rather than
 * something any reader can do by scanning.
 */
CREATE OR REPLACE FUNCTION public.remember_product_barcode(_barcode text, _product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF _barcode !~ '^[0-9]{8,14}$' THEN
    RETURN;
  END IF;

  INSERT INTO public.product_barcodes (barcode, product_id, created_by)
  VALUES (_barcode, _product_id, auth.uid())
  ON CONFLICT (barcode) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.get_product_by_barcode(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remember_product_barcode(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_by_barcode(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remember_product_barcode(text, uuid) TO authenticated;
