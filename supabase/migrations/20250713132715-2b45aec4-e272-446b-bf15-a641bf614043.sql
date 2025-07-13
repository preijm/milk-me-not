-- Update RLS policies for products table to allow authenticated users to register products
-- Drop the existing restrictive admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;

-- Create a new policy that allows authenticated users to insert products
CREATE POLICY "Authenticated users can register products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also update the other admin-only policies to be less restrictive for product_properties and product_flavors
-- since these are needed for product registration

-- For product_properties table
DROP POLICY IF EXISTS "Admins can insert product_properties" ON public.product_properties;
CREATE POLICY "Authenticated users can add product properties" 
ON public.product_properties 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- For product_flavors table  
DROP POLICY IF EXISTS "Admins can insert product_flavors" ON public.product_flavors;
CREATE POLICY "Authenticated users can add product flavors" 
ON public.product_flavors 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);