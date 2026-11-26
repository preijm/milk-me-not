-- The recovery attempt limit. Run locally with `npx supabase test db` (needs
-- the local stack); CI has no database, so it does not run these.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path to public, extensions;

select plan(12);

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-00000000a001', 'limit-a@example.test'),
  ('00000000-0000-4000-8000-00000000a002', 'limit-b@example.test');

-- Codes for user A, made the way the app makes them.
set local role authenticated;
set local request.jwt.claims to
  '{"sub": "00000000-0000-4000-8000-00000000a001", "role": "authenticated", "aal": "aal2"}';
create temp table codes on commit drop as
  select unnest(public.generate_mfa_recovery_codes()) as code;
grant select on codes to public;

-- Only the Edge Function may redeem, or anyone could spend someone else's
-- attempts.
select throws_ok(
  $$ select public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a001', 'x') $$,
  '42501', null, 'authenticated cannot redeem directly'
);
select throws_ok(
  $$ select count(*) from public.mfa_recovery_failures $$,
  '42501', null, 'authenticated cannot read the failure log'
);
reset role;

set local role anon;
select throws_ok(
  $$ select public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a001', 'x') $$,
  '42501', null, 'anon cannot redeem directly'
);
reset role;

-- As the Edge Function does it.
set local role service_role;

select is(
  public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a001', 'ffff-ffff-ffff'),
  'invalid', 'a wrong code is invalid'
);
select public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a001', 'ffff-ffff-fff' || n)
from generate_series(0, 3) n;
select is(
  (select count(*)::int from public.mfa_recovery_failures
   where user_id = '00000000-0000-4000-8000-00000000a001'),
  5, 'five failures are counted'
);

select is(
  public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a001', (select code from codes limit 1)),
  'limited', 'after five failures even a right code is refused'
);
select is(
  (select count(*)::int from public.mfa_recovery_codes
   where user_id = '00000000-0000-4000-8000-00000000a001'),
  10, 'a limited attempt does not spend the codes'
);
select is(
  (select count(*)::int from public.mfa_recovery_failures
   where user_id = '00000000-0000-4000-8000-00000000a001'),
  5, 'a limited attempt is not counted as another failure'
);

-- One account's failures do not lock out another.
select is(
  public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a002', 'ffff-ffff-ffff'),
  'invalid', 'another account is not limited'
);

-- An hour later the window has moved on. (Backdated as the owner: the
-- service role has no UPDATE on the table and needs none.)
reset role;
update public.mfa_recovery_failures set failed_at = now() - interval '61 minutes'
where user_id = '00000000-0000-4000-8000-00000000a001';
set local role service_role;
select is(
  public.redeem_mfa_recovery_code('00000000-0000-4000-8000-00000000a001', (select code from codes limit 1)),
  'ok', 'failures older than an hour no longer count'
);
select is(
  (select count(*)::int from public.mfa_recovery_failures
   where user_id = '00000000-0000-4000-8000-00000000a001'),
  0, 'a success clears the account''s failures'
);
select is(
  (select count(*)::int from public.mfa_recovery_codes
   where user_id = '00000000-0000-4000-8000-00000000a001'),
  0, 'a success spends the whole set'
);
reset role;

select * from finish();
rollback;
