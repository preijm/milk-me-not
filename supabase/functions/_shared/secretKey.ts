/**
 * Which Supabase key the admin client in an Edge Function should use.
 *
 * Supabase injects `SUPABASE_SECRET_KEYS` — a JSON object keyed by key name,
 * not a plain string — alongside the legacy `SUPABASE_SERVICE_ROLE_KEY`. The
 * legacy variable holds one half of an `anon`/`service_role` JWT pair signed by
 * the project's JWT secret, and both halves die together. They were **disabled
 * on 2026-11-26**, so the legacy branch below is no longer a working bridge: it
 * survives only to turn "no key at all" into one clear log line, and because
 * disabling is reversible from the dashboard. Reaching it means the function is
 * broken, which is why it logs at error level.
 *
 * The fallback is deliberately noisy. It logs which *variable* it resolved — a
 * name, never the value — at cold start, so `supabase logs --remote --service
 * functions --search "Supabase key in use"` answers "is the new key actually
 * live?" (there is no `functions logs` subcommand). Because this runs at module
 * scope, the answer is per cold start: an isolate that booted while
 * `SUPABASE_SECRET_KEYS` was still `{}` keeps the legacy key until it is
 * replaced, so redeploy after creating the key rather than waiting for the
 * environment to be picked up. Without the log the fallback would be silent:
 * a project with no secret key created yet keeps working on the legacy key, and
 * `check-rate-limit` fails open, so there would be no symptom to notice until
 * the legacy keys were disabled and rate limiting had quietly stopped.
 *
 * Both functions import this, so deploy them together:
 *   supabase functions deploy check-rate-limit mfa-recover
 */
export const resolveSecretKey = (): string => {
  const bundle = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (bundle) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(bundle);
    } catch {
      console.error("SUPABASE_SECRET_KEYS is not valid JSON; falling back to the legacy key");
    }

    const key = (parsed as Record<string, unknown> | undefined)?.["default"];
    if (typeof key === "string" && key.length > 0) {
      console.log("Supabase key in use: SUPABASE_SECRET_KEYS[default]");
      return key;
    }
    if (parsed !== undefined) {
      console.error(
        "SUPABASE_SECRET_KEYS has no usable `default` entry; falling back to the legacy key",
      );
    }
  }

  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!legacy) {
    // Nothing to authenticate with. Throwing beats handing createClient an
    // empty string, which fails later and further from the cause.
    throw new Error(
      "No Supabase secret key available: set SUPABASE_SECRET_KEYS or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  console.error(
    "Supabase key in use: SUPABASE_SERVICE_ROLE_KEY (legacy — DISABLED 2026-11-26, " +
      "every call with it answers 401). Create a secret key named `default` and redeploy.",
  );
  return legacy;
};
