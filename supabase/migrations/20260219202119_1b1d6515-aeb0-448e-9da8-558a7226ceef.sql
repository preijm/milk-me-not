
CREATE OR REPLACE FUNCTION public.search_product_types(search_term text)
 RETURNS TABLE(id uuid, brand_id uuid, brand_name text, product_name text, property_names text[], flavor_names text[], product_name_id uuid, is_barista boolean)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  safe_term text;
BEGIN
  -- Sanitize wildcard characters to prevent pattern manipulation
  safe_term := regexp_replace(search_term, '[%_\\]', '', 'g');
  
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
    psv.brand_name ILIKE '%' || safe_term || '%' OR
    psv.product_name ILIKE '%' || safe_term || '%' OR
    EXISTS (
      SELECT 1
      FROM unnest(psv.property_names) AS property_name
      WHERE property_name ILIKE '%' || safe_term || '%'
    ) OR
    EXISTS (
      SELECT 1
      FROM unnest(psv.flavor_names) AS flavor_name
      WHERE flavor_name ILIKE '%' || safe_term || '%'
    );
END;
$function$;
