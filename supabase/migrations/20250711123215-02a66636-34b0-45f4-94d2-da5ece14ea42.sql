-- Fix the search_product_types function by setting explicit search path and correct return type
CREATE OR REPLACE FUNCTION public.search_product_types(search_term text)
RETURNS TABLE(
  id uuid, 
  brand_id uuid, 
  brand_name text, 
  product_name text, 
  property_names text[], 
  flavor_names text[], 
  product_name_id uuid,
  is_barista boolean
) 
AS $$
BEGIN
  -- Set search path to empty string to ensure only explicitly schema-qualified names are used
  SET search_path = '';
  
  RETURN QUERY
  SELECT 
    psv.id,
    psv.brand_id,
    psv.brand_name,
    psv.product_name,
    psv.property_names,
    psv.flavor_names,
    psv.product_name_id,
    psv.is_barista
  FROM public.product_search_view psv
  WHERE 
    psv.brand_name ILIKE '%' || search_term || '%' OR
    psv.product_name ILIKE '%' || search_term || '%' OR
    EXISTS (
      SELECT 1
      FROM unnest(psv.property_names) AS property_name
      WHERE property_name ILIKE '%' || search_term || '%'
    ) OR
    EXISTS (
      SELECT 1
      FROM unnest(psv.flavor_names) AS flavor_name
      WHERE flavor_name ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql
   STABLE
   SECURITY INVOKER;