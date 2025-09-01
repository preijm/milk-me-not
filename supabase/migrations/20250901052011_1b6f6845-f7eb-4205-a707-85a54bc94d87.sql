-- Fix RLS policies for milk_tests_view to allow authenticated users to see all data
-- This enables the social feed functionality

-- First, drop existing RLS policies on the views if they exist
DROP POLICY IF EXISTS "Authenticated users can view all milk tests" ON milk_tests_view;
DROP POLICY IF EXISTS "Public can view aggregated results" ON milk_tests_aggregated_view;

-- Enable RLS on the views
ALTER TABLE milk_tests_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_tests_aggregated_view ENABLE ROW LEVEL SECURITY;

-- Create policy for milk_tests_view: authenticated users can see all individual tests (for social feed)
CREATE POLICY "Authenticated users can view all milk tests" 
ON milk_tests_view 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policy for milk_tests_aggregated_view: everyone can see aggregated data (for public results)
CREATE POLICY "Public can view aggregated results" 
ON milk_tests_aggregated_view 
FOR SELECT 
USING (true);

-- Update views to be SECURITY DEFINER so they can access underlying data
CREATE OR REPLACE VIEW milk_tests_view WITH (security_barrier = true) AS
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
    p.is_barista,
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
GROUP BY 
    mt.id, mt.user_id, mt.product_id, mt.rating, mt.notes, mt.shop_name, 
    mt.country_code, mt.price_quality_ratio, mt.picture_path, mt.drink_preference, 
    mt.created_at, b.id, b.name, n.name, p.username, p.is_barista;

-- Update aggregated view to be SECURITY DEFINER
CREATE OR REPLACE VIEW milk_tests_aggregated_view WITH (security_barrier = true) AS
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