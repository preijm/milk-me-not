-- Remove duplicate shops, keeping only unique shop names
-- First, create a staging table with cleaned names and one record per unique name
CREATE TEMP TABLE shops_to_keep AS
SELECT DISTINCT ON (
  CASE 
    WHEN name ~ '\s*\([A-Z]{2}\)\s*$' THEN 
      TRIM(REGEXP_REPLACE(name, '\s*\([A-Z]{2}\)\s*$', ''))
    ELSE name 
  END
) 
  id,
  CASE 
    WHEN name ~ '\s*\([A-Z]{2}\)\s*$' THEN 
      TRIM(REGEXP_REPLACE(name, '\s*\([A-Z]{2}\)\s*$', ''))
    ELSE name 
  END as clean_name
FROM shops 
WHERE name IS NOT NULL AND name != ''
ORDER BY 
  CASE 
    WHEN name ~ '\s*\([A-Z]{2}\)\s*$' THEN 
      TRIM(REGEXP_REPLACE(name, '\s*\([A-Z]{2}\)\s*$', ''))
    ELSE name 
  END,
  created_at ASC;

-- Delete all shops except the ones we want to keep
DELETE FROM shops 
WHERE id NOT IN (SELECT id FROM shops_to_keep);

-- Update the remaining shop names to remove country codes and clear country_code
UPDATE shops 
SET 
  name = (SELECT clean_name FROM shops_to_keep WHERE shops_to_keep.id = shops.id),
  country_code = NULL;

-- Drop the temp table
DROP TABLE shops_to_keep;