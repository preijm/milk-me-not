-- Fix RLS policy for profiles table to allow anonymous users to count profiles
-- This will allow the member count to be displayed on the home page for non-authenticated users

-- Drop the conflicting policy that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Ensure the public policy is working correctly
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a clear policy that allows anyone to view profiles (needed for member count)
CREATE POLICY "Anyone can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep the existing policies for user operations
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);