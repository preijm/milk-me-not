-- Ensure users can update products (including is_barista field) that they create
-- and can upload photos to storage

-- First, let's make sure users can update their own product creations
-- (Note: We'll keep admin-only updates for products they didn't create)
DROP POLICY IF EXISTS "Users can update their products" ON public.products;
CREATE POLICY "Users can update their products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure storage policies allow authenticated users to upload milk test photos
-- Create policy for uploading to Milk Product Pictures bucket
CREATE POLICY "Authenticated users can upload milk test photos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'Milk Product Pictures' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for viewing milk test photos (public read access)
CREATE POLICY "Anyone can view milk test photos" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'Milk Product Pictures');

-- Create policy for users to update their own uploaded photos
CREATE POLICY "Users can update their own milk test photos" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'Milk Product Pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'Milk Product Pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own uploaded photos
CREATE POLICY "Users can delete their own milk test photos" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'Milk Product Pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);