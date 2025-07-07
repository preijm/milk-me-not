-- Add badge_color column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN badge_color text DEFAULT 'emerald';