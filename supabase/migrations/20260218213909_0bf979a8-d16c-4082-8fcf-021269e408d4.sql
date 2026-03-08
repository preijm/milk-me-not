
-- Fix INSERT policy: ensure users can only upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload milk product pictures" ON storage.objects;

CREATE POLICY "Users can upload to own folder only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Milk Product Pictures' AND
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix UPDATE policy: ensure users can only update files in their own folder
DROP POLICY IF EXISTS "Users can update their own milk product pictures" ON storage.objects;

CREATE POLICY "Users can update own files only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Milk Product Pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'Milk Product Pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix DELETE policy: ensure users can only delete files in their own folder
DROP POLICY IF EXISTS "Users can delete their own milk product pictures" ON storage.objects;

CREATE POLICY "Users can delete own files only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Milk Product Pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
