-- Add separate country_code and shop_name columns to milk_tests table
ALTER TABLE public.milk_tests 
ADD COLUMN country_code text,
ADD COLUMN shop_name text;

-- Migrate existing data from shop_id to new columns (only for records with valid shop_id)
UPDATE public.milk_tests 
SET 
  country_code = shops.country_code,
  shop_name = shops.name
FROM public.shops 
WHERE milk_tests.shop_id = shops.id;

-- For records without a shop, we'll need to set a default country or leave them null for now
-- We can't make country_code required until all records have a value
-- Create index for better performance on country lookups
CREATE INDEX idx_milk_tests_country_code ON public.milk_tests(country_code);

-- Create index for shop name searches
CREATE INDEX idx_milk_tests_shop_name ON public.milk_tests(shop_name);

-- Drop the old shop_id column
ALTER TABLE public.milk_tests DROP COLUMN shop_id;