-- Add column to track feed visibility preference
ALTER TABLE public.milk_tests 
ADD COLUMN is_hidden_from_feed boolean NOT NULL DEFAULT false;