-- Remove product_flavor links for the "test" flavor
DELETE FROM public.product_flavors WHERE flavor_id = '347f8c74-47a9-4936-9d43-fad099af4feb';

-- Remove the "test" flavor itself
DELETE FROM public.flavors WHERE id = '347f8c74-47a9-4936-9d43-fad099af4feb';