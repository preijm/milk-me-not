-- Fix critical security issue: Restrict access to milk_tests table
-- Current issue: Table is publicly readable, exposing user reviews and personal data

-- 1. Remove dangerous policies that expose all user data
DROP POLICY IF EXISTS "Anonymous users can count milk tests for public stats" ON public.milk_tests;
DROP POLICY IF EXISTS "Authenticated users can view milk tests" ON public.milk_tests;

-- 2. Create secure function for public stats that doesn't expose individual records
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(total_members bigint, total_tests bigint, total_products bigint, total_brands bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_members,
    (SELECT COUNT(*) FROM public.milk_tests) as total_tests,
    (SELECT COUNT(*) FROM public.products) as total_products,
    (SELECT COUNT(*) FROM public.brands) as total_brands;
$$;

-- 3. Create secure aggregated data view that anonymizes user data
CREATE OR REPLACE VIEW public.milk_tests_aggregated_view AS
SELECT 
  mt.product_id,
  mt.rating,
  mt.drink_preference,
  mt.price_quality_ratio,
  mt.country_code,
  mt.created_at,
  -- Include brand and product info but NO user identifiers
  b.name as brand_name,
  n.name as product_name,
  p.is_barista,
  -- Aggregate property and flavor names
  COALESCE(
    (SELECT array_agg(pr.name ORDER BY pr.ordering) 
     FROM public.product_properties pp 
     JOIN public.properties pr ON pp.property_id = pr.id 
     WHERE pp.product_id = mt.product_id), 
    ARRAY[]::text[]
  ) as property_names,
  COALESCE(
    (SELECT array_agg(fl.name ORDER BY fl.ordering) 
     FROM public.product_flavors pf 
     JOIN public.flavors fl ON pf.flavor_id = fl.id 
     WHERE pf.product_id = mt.product_id), 
    ARRAY[]::text[]
  ) as flavor_names
FROM public.milk_tests mt
LEFT JOIN public.products p ON mt.product_id = p.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.names n ON p.name_id = n.id;

-- 4. Create secure policies for milk_tests

-- Users can only view their own milk tests with full details
CREATE POLICY "Users can view own milk tests" 
ON public.milk_tests 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow public access to anonymized aggregated view only
-- This replaces the dangerous public access to the main table