-- Recovery code hashing. Run locally with `npx supabase test db` (needs the
-- local stack); CI has no database, so it does not run these.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path to public, extensions;

select plan(12);

-- A throwaway user to own the codes.
insert into auth.users (id, email)
values ('00000000-0000-4000-8000-00000000f00d', 'mfa-test@example.test');

-- A session that has given its 6-digit code.
set local role authenticated;
set local request.jwt.claims to
  '{"sub": "00000000-0000-4000-8000-00000000f00d", "role": "authenticated", "aal": "aal2"}';

create temp table codes on commit drop as
  select unnest(public.generate_mfa_recovery_codes()) as code;
grant select on codes to public;

select is((select count(*)::int from codes), 10, 'ten codes are generated');
select is(public.mfa_recovery_codes_remaining(), 10, 'all ten are counted');

-- Nobody outside the definer functions may compute a hash: it would be an
-- oracle for the pepper.
select throws_ok(
  $$ select public.hash_mfa_recovery_code('abcd') $$,
  '42501', null, 'authenticated cannot call the hash function'
);
select throws_ok(
  $$ select public.consume_mfa_recovery_code('00000000-0000-4000-8000-00000000f00d', 'x') $$,
  '42501', null, 'authenticated cannot consume a code directly'
);

reset role;

set local role anon;
select throws_ok(
  $$ select public.hash_mfa_recovery_code('abcd') $$,
  '42501', null, 'anon cannot call the hash function'
);
reset role;

-- The stored hash is keyed: not the old unsalted sha256, and not computable
-- from the code alone.
select is(
  (select count(*)::int
   from public.mfa_recovery_codes r
   join codes c
     on r.code_hash = encode(sha256(convert_to(replace(c.code, '-', ''), 'UTF8')), 'hex')
   where r.user_id = '00000000-0000-4000-8000-00000000f00d'),
  0,
  'no stored hash is a plain sha256 of its code'
);
select is(
  (select count(*)::int
   from public.mfa_recovery_codes r
   join codes c on r.code_hash = public.hash_mfa_recovery_code(c.code)
   where r.user_id = '00000000-0000-4000-8000-00000000f00d'),
  10,
  'every stored hash is the HMAC of its code'
);

-- Consuming, as the edge function does it (service_role).
set local role service_role;
select is(
  public.consume_mfa_recovery_code('00000000-0000-4000-8000-00000000f00d', 'ffff-ffff-ffff'),
  false,
  'a wrong code is refused'
);
select is(
  public.consume_mfa_recovery_code(
    '00000000-0000-4000-8000-00000000f00d',
    -- Typed off paper: upper case, spaces instead of dashes.
    (select upper(replace(code, '-', ' ')) from codes limit 1)
  ),
  true,
  'a real code is accepted however it is typed'
);
reset role;

select is(
  (select count(*)::int from public.mfa_recovery_codes
   where user_id = '00000000-0000-4000-8000-00000000f00d'),
  0,
  'using one code spends the whole set'
);

-- A pepper that has gone missing must fail loudly, not hash to NULL.
-- Through the Vault API: the test role may not write vault.secrets directly.
select vault.update_secret(id, new_name => 'mfa_recovery_code_pepper_moved')
from vault.secrets where name = 'mfa_recovery_code_pepper';
select throws_ok(
  $$ select public.hash_mfa_recovery_code('abcd') $$,
  'P0001', 'mfa_recovery_code_pepper is missing from Vault',
  'a missing pepper raises'
);
select vault.update_secret(id, new_name => 'mfa_recovery_code_pepper')
from vault.secrets where name = 'mfa_recovery_code_pepper_moved';

select is(
  (select count(*)::int from vault.secrets where name = 'mfa_recovery_code_pepper'),
  1,
  'exactly one pepper exists'
);

select * from finish();
rollback;
