-- Ensure the Milk Product Pictures bucket is public and has proper policies
-- Update bucket to be public if not already
UPDATE storage.buckets 
SET public = true 
WHERE id = 'Milk Product Pictures';

-- Create comprehensive storage policies for the Milk Product Pictures bucket
CREATE POLICY "Anyone can view milk product pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'Milk Product Pictures');

CREATE POLICY "Authenticated users can upload milk product pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'Milk Product Pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own milk product pictures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'Milk Product Pictures' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'Milk Product Pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own milk product pictures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'Milk Product Pictures' AND auth.uid() IS NOT NULL);