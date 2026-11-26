/**
 * Which Supabase key the admin client in an Edge Function should use.
 *
 * Supabase injects `SUPABASE_SECRET_KEYS` — a JSON object keyed by key name,
 * not a plain string. The key created for this project is named `default`.
 *
 * There is no fallback. The legacy `SUPABASE_SERVICE_ROLE_KEY` is still in the
 * environment, and this deliberately ignores it: it holds one half of an
 * `anon`/`service_role` JWT pair signed by the project's JWT secret, both
 * halves were disabled on 2026-11-26, and every call made with one now answers
 * `401 Legacy API keys are disabled`. Reading it would buy nothing except a
 * failure further from its cause — a 401 deep inside an admin call rather than
 * a boot error naming the fix.
 *
 * So this throws instead, at module scope, and the function fails to boot. That
 * is the intended behaviour: with no usable key neither function can do its job
 * (both exist precisely to bypass RLS), and a boot error puts one legible line
 * in the log instead of scattering 401s through a request that looks like it
 * nearly worked.
 *
 * On success it logs which *variable* it resolved — a name, never the value —
 * so this answers "is the new key actually live?":
 *
 *   supabase logs --remote --service functions --search "Supabase key in use"
 *
 * (There is no `functions logs` subcommand.) Because this runs at module scope
 * the answer is per cold start, so redeploy after changing the key rather than
 * waiting for a running isolate to notice.
 *
 * Both functions import this, so deploy them together:
 *   supabase functions deploy check-rate-limit mfa-recover
 */

const unusable = (reason: string) =>
  new Error(
    `${reason}. Create a secret key named \`default\` under Project Settings → ` +
      "API Keys → Secret keys, then redeploy. SUPABASE_SERVICE_ROLE_KEY is not a " +
      "fallback: the legacy keys were disabled on 2026-11-26 and every call with " +
      "one answers 401.",
  );

export const resolveSecretKey = (): string => {
  const bundle = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!bundle) {
    throw unusable("SUPABASE_SECRET_KEYS is not set");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bundle);
  } catch {
    throw unusable("SUPABASE_SECRET_KEYS is not valid JSON");
  }

  // An empty bundle is `{}`, which is what a project with no secret key yet
  // looks like — not a missing variable, so it has to be checked by content.
  const key = (parsed as Record<string, unknown> | null)?.["default"];
  if (typeof key !== "string" || key.length === 0) {
    throw unusable("SUPABASE_SECRET_KEYS has no usable `default` entry");
  }

  console.log("Supabase key in use: SUPABASE_SECRET_KEYS[default]");
  return key;
};
