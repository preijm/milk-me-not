import { supabase } from "@/integrations/supabase/client";

/**
 * Recovery codes for two-step sign-in. The database half is in
 * 20261006220000_mfa_recovery_codes.sql, the server half in the mfa-recover
 * edge function.
 *
 * These functions are newer than the generated types, so they are called
 * untyped here rather than by hand-editing types.ts. Once `npm run types:gen`
 * picks them up, the cast can go.
 */
const rpc = supabase.rpc.bind(supabase) as unknown as (
  fn: string,
) => Promise<{ data: unknown; error: Error | null }>;

/** Ten new codes, replacing the old set. Needs a session that gave its 6-digit code. */
export const generateRecoveryCodes = async (): Promise<string[]> => {
  const { data, error } = await rpc("generate_mfa_recovery_codes");
  if (error) throw error;
  return data as string[];
};

export const recoveryCodesRemaining = async (): Promise<number> => {
  const { data } = await rpc("mfa_recovery_codes_remaining");
  return typeof data === "number" ? data : 0;
};

/**
 * Throws away any unused codes once two-step sign-in is off. Best effort: the
 * database only acts when the authenticator is really gone, and the next
 * setup replaces the set anyway, so a failure here is not worth an error.
 */
export const clearRecoveryCodes = async (): Promise<void> => {
  await rpc("clear_mfa_recovery_codes");
};

export type RedeemResult = "ok" | "invalid" | "limited";

/**
 * Uses a code to remove the authenticator from this account. On "ok" the
 * reader is still signed in with their password, and two-step sign-in is off.
 * "limited" means too many wrong codes in the last hour (the function's 429);
 * anything else that goes wrong reads as "invalid".
 */
export const redeemRecoveryCode = async (code: string): Promise<RedeemResult> => {
  const { error } = await supabase.functions.invoke("mfa-recover", { body: { code } });
  if (error) {
    // A non-2xx reply is a FunctionsHttpError whose context is the Response.
    const status = (error as { context?: { status?: unknown } }).context?.status;
    return status === 429 ? "limited" : "invalid";
  }
  await supabase.auth.refreshSession();
  return "ok";
};
