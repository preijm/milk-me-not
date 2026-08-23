-- The two triggers that turn a new auth user into an app user.
--
-- These sit on `auth.users`, so the baseline beside this file does not carry
-- them: it dumps the `public` schema, and dumping `auth` wholesale is not
-- something to replay — Supabase owns that schema and its contents differ
-- between projects.
--
-- The functions they call are in the baseline; only the wiring is here. Miss
-- it and a rebuilt database looks healthy until someone signs up, at which
-- point they get an account with no profile row and no role, and most of the
-- app quietly fails for them.
--
-- CREATE OR REPLACE TRIGGER needs Postgres 14; the deployed database is 17.

CREATE OR REPLACE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

CREATE OR REPLACE TRIGGER "on_auth_user_created_assign_role"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user_role"();
