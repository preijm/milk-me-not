-- Allow authenticated users to add new shops
CREATE POLICY "Authenticated users can add shops" 
ON public.shops 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to add new brands
CREATE POLICY "Authenticated users can add brands" 
ON public.brands 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to add new flavors
CREATE POLICY "Authenticated users can add flavors" 
ON public.flavors 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);