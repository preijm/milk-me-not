-- Add default_country_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN default_country_code text REFERENCES public.countries(code);

-- Create index for better performance
CREATE INDEX idx_profiles_default_country ON public.profiles(default_country_code);