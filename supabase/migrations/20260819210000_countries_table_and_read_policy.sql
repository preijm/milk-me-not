-- Bring `countries` under version control.
--
-- The table exists in the deployed database but was never in a migration: it
-- was created through the dashboard, so three earlier migrations add policies
-- to a table that, as far as this folder is concerned, does not exist.
--
-- This does not make the folder rebuildable, and is not trying to. Ten more
-- tables are missing the same way, `products` and `milk_tests` among them, and
-- the earliest migration already writes to `profiles`; that needs a baseline
-- dump of the live database, not another migration. See CLAUDE.md.
--
-- What it does do is write down what the deployed table looks like, so the
-- policies below are reviewable in the repo rather than only in a dashboard.
-- Every statement is a no-op against the deployed database.

CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A country appears once. Added only alongside a fresh table, because a
-- deployed table with duplicates would fail the constraint and take the whole
-- migration down with it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'countries_code_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.countries GROUP BY code HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.countries ADD CONSTRAINT countries_code_key UNIQUE (code);
  END IF;
END $$;

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Reading is for signed-in users, which is what the deployed database already
-- does and what the app needs: every screen that reads this table — the rating
-- form, the country setting — sits behind a login. The public map used to read
-- it too and quietly got nothing; it now takes country names from the browser
-- instead, so nothing anonymous depends on this.
DROP POLICY IF EXISTS "Authenticated users can read countries" ON public.countries;
CREATE POLICY "Authenticated users can read countries"
ON public.countries
FOR SELECT
TO authenticated
USING (true);

-- Writing stays with admins, matching the policies in 20250713095322.
DROP POLICY IF EXISTS "Admins can insert countries" ON public.countries;
CREATE POLICY "Admins can insert countries"
ON public.countries
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update countries" ON public.countries;
CREATE POLICY "Admins can update countries"
ON public.countries
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete countries" ON public.countries;
CREATE POLICY "Admins can delete countries"
ON public.countries
FOR DELETE
TO authenticated
USING (public.is_admin());

-- No rows are seeded. Which entries belong in a country list is an editorial
-- call — ISO 3166 lists 280 regions including territories — and inventing one
-- here would either contradict the deployed table or quietly add rows to it.
-- A fresh database therefore starts with an empty country list and an empty
-- autocomplete until it is populated.
