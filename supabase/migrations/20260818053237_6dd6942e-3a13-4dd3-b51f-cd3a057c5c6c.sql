CREATE OR REPLACE FUNCTION public.get_profile_username(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.username FROM public.profiles p WHERE p.id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.id = _user_id
$$;

REVOKE ALL ON FUNCTION public.get_profile_username(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_username(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

CREATE OR REPLACE VIEW public.milk_tests_private_view
WITH (security_invoker = on) AS
SELECT mt.id,
    mt.user_id,
    mt.product_id,
    mt.rating,
    mt.notes,
    mt.shop_name,
    mt.country_code,
    mt.price_quality_ratio,
    mt.picture_path,
    mt.drink_preference,
    mt.created_at,
    b.id AS brand_id,
    b.name AS brand_name,
    n.name AS product_name,
    public.get_profile_username(mt.user_id) AS username,
    prod.is_barista,
    COALESCE(array_agg(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL), ARRAY[]::text[]) AS property_names,
    COALESCE(array_agg(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL), ARRAY[]::text[]) AS flavor_names
   FROM milk_tests mt
     LEFT JOIN products prod ON mt.product_id = prod.id
     LEFT JOIN brands b ON prod.brand_id = b.id
     LEFT JOIN names n ON prod.name_id = n.id
     LEFT JOIN product_properties pprop ON prod.id = pprop.product_id
     LEFT JOIN properties prop ON pprop.property_id = prop.id
     LEFT JOIN product_flavors pf ON prod.id = pf.product_id
     LEFT JOIN flavors fl ON pf.flavor_id = fl.id
  GROUP BY mt.id, mt.user_id, mt.product_id, mt.rating, mt.notes, mt.shop_name, mt.country_code, mt.price_quality_ratio, mt.picture_path, mt.drink_preference, mt.created_at, b.id, b.name, n.name, prod.is_barista;

DROP VIEW IF EXISTS public.profiles_public;
