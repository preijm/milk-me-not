
-- Drop the wrongly-named policies (used bucket name instead of bucket id)
DROP POLICY IF EXISTS "Users can upload to own folder only" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files only" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files only" ON storage.objects;

-- Recreate with correct bucket id: 'milk-pictures'
CREATE POLICY "Users can upload to own folder only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'milk-pictures' AND
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'milk-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'milk-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'milk-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
