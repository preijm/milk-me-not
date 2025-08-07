-- Update the milk test to point to the unsweetened product
-- Keep the one with "Unsweetened" property as the main product
UPDATE milk_tests 
SET product_id = '6420f7fe-0434-4dc6-bc2f-157c076a4171'
WHERE product_id = '0a35a3c0-e4b6-410f-9f32-e1d3bfea5a5b';

-- Add the "No Sugar" property to the main product (since it's essentially the same)
INSERT INTO product_properties (product_id, property_id)
SELECT '6420f7fe-0434-4dc6-bc2f-157c076a4171', id 
FROM properties 
WHERE key = 'no_sugar'
ON CONFLICT DO NOTHING;

-- Remove the duplicate product
DELETE FROM products WHERE id = '0a35a3c0-e4b6-410f-9f32-e1d3bfea5a5b';