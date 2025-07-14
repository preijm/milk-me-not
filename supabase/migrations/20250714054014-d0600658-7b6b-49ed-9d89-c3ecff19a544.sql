-- Drop the existing check constraint that prevents ratings below 1
ALTER TABLE public.milk_tests DROP CONSTRAINT IF EXISTS milk_tests_rating_check;

-- Add a new check constraint that allows ratings from 0 to 10
ALTER TABLE public.milk_tests ADD CONSTRAINT milk_tests_rating_check CHECK (rating >= 0 AND rating <= 10);