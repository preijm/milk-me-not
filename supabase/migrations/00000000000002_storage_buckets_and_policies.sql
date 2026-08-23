-- The buckets the app uploads to, and who may touch what inside them.
--
-- Like the auth triggers beside this file, none of it is in the baseline: the
-- baseline dumps `public`, and these live in `storage`. Buckets are rows
-- rather than tables, so even a `storage` schema dump would not carry them.
--
-- Miss this and the app builds, runs, and fails the moment anyone uploads an
-- avatar or a photo of a carton.
--
-- Copied from the deployed database rather than written from scratch, so the
-- policies below are the ones actually in force today.

INSERT INTO "storage"."buckets" ("id", "name", "public")
VALUES
  ('milk-pictures', 'Milk Product Pictures', true),
  ('logos', 'logos', true),
  ('avatars', 'avatars', true)
ON CONFLICT ("id") DO NOTHING;

-- Anyone may look; only the owner may write, and only inside their own folder.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON "storage"."objects";
CREATE POLICY "Avatar images are publicly accessible"
  ON "storage"."objects" FOR SELECT
  USING (("bucket_id" = 'avatars'::"text"));

DROP POLICY IF EXISTS "Public read access to milk test pictures" ON "storage"."objects";
CREATE POLICY "Public read access to milk test pictures"
  ON "storage"."objects" FOR SELECT
  USING (("bucket_id" = 'milk-pictures'::"text"));

DROP POLICY IF EXISTS "Users can upload their own avatar" ON "storage"."objects";
CREATE POLICY "Users can upload their own avatar"
  ON "storage"."objects" FOR INSERT
  WITH CHECK ((("bucket_id" = 'avatars'::"text") AND (("auth"."uid"())::"text" = ("storage"."foldername"("name"))[1])));

DROP POLICY IF EXISTS "Users can update their own avatar" ON "storage"."objects";
CREATE POLICY "Users can update their own avatar"
  ON "storage"."objects" FOR UPDATE
  USING ((("bucket_id" = 'avatars'::"text") AND (("auth"."uid"())::"text" = ("storage"."foldername"("name"))[1])));

DROP POLICY IF EXISTS "Users can delete their own avatar" ON "storage"."objects";
CREATE POLICY "Users can delete their own avatar"
  ON "storage"."objects" FOR DELETE
  USING ((("bucket_id" = 'avatars'::"text") AND (("auth"."uid"())::"text" = ("storage"."foldername"("name"))[1])));

DROP POLICY IF EXISTS "Users can upload to their own folder only" ON "storage"."objects";
CREATE POLICY "Users can upload to their own folder only"
  ON "storage"."objects" FOR INSERT TO "authenticated"
  WITH CHECK ((("bucket_id" = 'milk-pictures'::"text")
    AND (("storage"."foldername"("name"))[1] = ("auth"."uid"())::"text")
    AND ("array_length"("storage"."foldername"("name"), 1) = 1)));

DROP POLICY IF EXISTS "Users can update their own milk test pictures" ON "storage"."objects";
CREATE POLICY "Users can update their own milk test pictures"
  ON "storage"."objects" FOR UPDATE TO "authenticated"
  USING ((("bucket_id" = 'milk-pictures'::"text")
    AND (("storage"."foldername"("name"))[1] = ("auth"."uid"())::"text")
    AND ("owner" = "auth"."uid"())))
  WITH CHECK ((("bucket_id" = 'milk-pictures'::"text")
    AND (("storage"."foldername"("name"))[1] = ("auth"."uid"())::"text")
    AND ("owner" = "auth"."uid"())));

DROP POLICY IF EXISTS "Users can delete their own milk test pictures" ON "storage"."objects";
CREATE POLICY "Users can delete their own milk test pictures"
  ON "storage"."objects" FOR DELETE TO "authenticated"
  USING ((("bucket_id" = 'milk-pictures'::"text")
    AND (("storage"."foldername"("name"))[1] = ("auth"."uid"())::"text")
    AND ("owner" = "auth"."uid"())));
