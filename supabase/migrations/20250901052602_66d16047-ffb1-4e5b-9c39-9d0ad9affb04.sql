-- Drop and recreate views to fix structure and security issues
DROP VIEW IF EXISTS milk_tests_view CASCADE;
DROP VIEW IF EXISTS milk_tests_aggregated_view CASCADE;

-- Recreate milk_tests_view (for user's own data only)
CREATE VIEW milk_tests_view AS
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
    b.id as brand_id,
    b.name as brand_name,
    n.name as product_name,
    p.username,
    prod.is_barista,
    COALESCE(
        ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
        ARRAY[]::text[]
    ) as property_names,
    COALESCE(
        ARRAY_AGG(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
        ARRAY[]::text[]
    ) as flavor_names
FROM public.milk_tests mt
LEFT JOIN public.products prod ON mt.product_id = prod.id
LEFT JOIN public.brands b ON prod.brand_id = b.id
LEFT JOIN public.names n ON prod.name_id = n.id
LEFT JOIN public.profiles p ON mt.user_id = p.id
LEFT JOIN public.product_properties pp ON prod.id = pp.product_id
LEFT JOIN public.properties prop ON pp.property_id = prop.id
LEFT JOIN public.product_flavors pf ON prod.id = pf.product_id
LEFT JOIN public.flavors fl ON pf.flavor_id = fl.id
WHERE mt.user_id = auth.uid()  -- Only show user's own data
GROUP BY 
    mt.id, mt.user_id, mt.product_id, mt.rating, mt.notes, mt.shop_name, 
    mt.country_code, mt.price_quality_ratio, mt.picture_path, mt.drink_preference, 
    mt.created_at, b.id, b.name, n.name, p.username, prod.is_barista;

-- Recreate milk_tests_aggregated_view (for public aggregated data)
CREATE VIEW milk_tests_aggregated_view AS
SELECT 
    mt.product_id,
    mt.rating,
    mt.price_quality_ratio,
    mt.country_code,
    mt.drink_preference,
    mt.created_at,
    b.name as brand_name,
    n.name as product_name,
    prod.is_barista,
    COALESCE(
        ARRAY_AGG(DISTINCT prop.name) FILTER (WHERE prop.name IS NOT NULL),
        ARRAY[]::text[]
    ) as property_names,
    COALESCE(
        ARRAY_AGG(DISTINCT fl.name) FILTER (WHERE fl.name IS NOT NULL),
        ARRAY[]::text[]
    ) as flavor_names
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