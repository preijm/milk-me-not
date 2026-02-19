-- Drop all orphaned policies that reference the display name 'Milk Product Pictures' (they never work)
DROP POLICY IF EXISTS "Anyone can view milk product pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view milk test photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload milk test photos" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 151g4p7_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own milk test photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own milk test photos" ON storage.objects;

-- Drop duplicate policies that reference the correct bucket ID but are superseded
DROP POLICY IF EXISTS "Users can delete own files only" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files only" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder only" ON storage.objects;

-- Now we're left with only the correct, clean policies for milk-pictures:
-- "Public read access to milk test pictures" (SELECT, bucket_id = 'milk-pictures') ✅
-- "Users can upload to their own folder only" (INSERT, checks folder depth + uid) ✅
-- "Users can update their own milk test pictures" (UPDATE, checks folder + owner) ✅
-- "Users can delete their own milk test pictures" (DELETE, checks folder + owner) ✅
