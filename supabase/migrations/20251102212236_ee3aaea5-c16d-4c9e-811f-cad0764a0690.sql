-- Fix Security Definer View warning by setting security_invoker=true on all views
-- and updating RLS policies to allow authenticated users to view all milk tests

-- First, update the milk_tests RLS policy to allow authenticated users to view ALL tests
-- This enables the social feed functionality
DROP POLICY IF EXISTS "Users can view own milk tests" ON public.milk_tests;
DROP POLICY IF EXISTS "owner can read own rows" ON public.milk_tests;

CREATE POLICY "Authenticated users can view all milk tests"
ON public.milk_tests
FOR SELECT
TO authenticated
USING (true);

-- Now recreate all views with security_invoker=true
-- This makes views execute with the permissions of the querying user, not the view creator

DROP VIEW IF EXISTS public.milk_tests_view;
CREATE VIEW public.milk_tests_view 
WITH (security_invoker=true) AS
SELECT 
    mt.id,
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
    p.username,
    prod.is_barista,
    COALESCE(
        array_agg(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS property_names,
    COALESCE(
        array_agg(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS flavor_names
FROM public.milk_tests mt
LEFT JOIN public.products prod ON mt.product_id = prod.id
LEFT JOIN public.brands b ON prod.brand_id = b.id
LEFT JOIN public.names n ON prod.name_id = n.id
LEFT JOIN public.profiles p ON mt.user_id = p.id
LEFT JOIN public.product_properties pp ON prod.id = pp.product_id
LEFT JOIN public.properties prop ON pp.property_id = prop.id
LEFT JOIN public.product_flavors pf ON prod.id = pf.product_id
LEFT JOIN public.flavors fl ON pf.flavor_id = fl.id
GROUP BY 
    mt.id, mt.user_id, mt.product_id, mt.rating, mt.notes, mt.shop_name, 
    mt.country_code, mt.price_quality_ratio, mt.picture_path, mt.drink_preference, 
    mt.created_at, b.id, b.name, n.name, p.username, prod.is_barista;

DROP VIEW IF EXISTS public.milk_tests_aggregated_view;
CREATE VIEW public.milk_tests_aggregated_view
WITH (security_invoker=true) AS
SELECT 
    mt.product_id,
    mt.rating,
    mt.price_quality_ratio,
    mt.country_code,
    mt.drink_preference,
    mt.created_at,
    b.name AS brand_name,
    n.name AS product_name,
    prod.is_barista,
    COALESCE(
        array_agg(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS property_names,
    COALESCE(
        array_agg(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
        ARRAY[]::text[]
    ) AS flavor_names
FROM public.milk_tests mt
LEFT JOIN public.products prod ON mt.product_id = prod.id
LEFT JOIN public.brands b ON prod.brand_id = b.id
LEFT JOIN public.names n ON prod.name_id = n.id
LEFT JOIN public.product_properties pp ON prod.id = pp.product_id
LEFT JOIN public.properties prop ON pp.property_id = prop.id
LEFT JOIN public.product_flavors pf ON prod.id = pf.product_id
LEFT JOIN public.flavors fl ON pf.flavor_id = fl.id
GROUP BY 
    mt.product_id, mt.rating, mt.price_quality_ratio, mt.country_code, 
    mt.drink_preference, mt.created_at, b.name, n.name, prod.is_barista;

DROP VIEW IF EXISTS public.product_search_view;
CREATE VIEW public.product_search_view
WITH (security_invoker=true) AS
SELECT 
    p.id,
    b.id AS brand_id,
    b.name AS brand_name,
    n.name AS product_name,
    n.id AS product_name_id,
    (SELECT array_agg(prop.key)
     FROM product_properties pp
     JOIN properties prop ON pp.property_id = prop.id
     WHERE pp.product_id = p.id) AS property_names,
    p.is_barista,
    (SELECT array_agg(f.key)
     FROM product_flavors pf
     JOIN flavors f ON pf.flavor_id = f.id
     WHERE pf.product_id = p.id) AS flavor_names
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN names n ON p.name_id = n.id;