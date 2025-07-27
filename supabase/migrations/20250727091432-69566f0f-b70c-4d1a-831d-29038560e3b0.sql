-- Remove "Unknown" shop references from milk tests
UPDATE milk_tests 
SET shop_name = NULL 
WHERE shop_name = 'Unknown';