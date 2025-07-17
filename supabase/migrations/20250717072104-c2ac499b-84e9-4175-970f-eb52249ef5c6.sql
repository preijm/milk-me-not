-- Ensure storage policies exist for milk pictures bucket
-- First check if bucket exists with correct name
INSERT INTO storage.buckets (id, name, public)
VALUES ('milk-pictures', 'Milk Product Pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for authenticated users to upload their own files
CREATE POLICY "Users can upload their own milk test pictures" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'milk-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own milk test pictures" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'milk-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own milk test pictures" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'milk-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own milk test pictures" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'milk-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also allow public read access to milk test pictures since this is for sharing results
CREATE POLICY "Public read access to milk test pictures" ON storage.objects
FOR SELECT 
USING (bucket_id = 'milk-pictures');