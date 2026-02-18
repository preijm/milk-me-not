-- Remove all existing milk-pictures storage policies (duplicates and weak ones)
DROP POLICY IF EXISTS "Allow authenticated users to upload pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own milk test pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to milk test pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own milk test pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own milk test pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own milk test pictures" ON storage.objects;

-- INSERT: enforce exactly {user_id}/{filename} folder depth and that first folder = auth.uid()
CREATE POLICY "Users can upload to their own folder only"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'milk-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND array_length(storage.foldername(name), 1) = 1
);

-- SELECT: public read for sharing review images (bucket is intentionally public)
CREATE POLICY "Public read access to milk test pictures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'milk-pictures');

-- UPDATE: only the file owner can update, verified via owner column
CREATE POLICY "Users can update their own milk test pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'milk-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'milk-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND owner = auth.uid()
);

-- DELETE: only the file owner can delete, verified via owner column
CREATE POLICY "Users can delete their own milk test pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'milk-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND owner = auth.uid()
);