import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jtabjndnietpewvknjrm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0YWJqbmRuaWV0cGV3dmtuanJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTY4MjIsImV4cCI6MjA1NDA5MjgyMn0.NrVqEaLRyCt4ut8-9potmOH_3JsSbMr8aq8XyKv-Q7s";

const RECOVERY_MODE_KEY = "passwordRecoveryMode";
const RECOVERY_ACCESS_TOKEN_KEY = "passwordRecoveryAccessToken";

export function getRecoveryFromUrlHash(): {
  type: string | null;
  accessToken: string | null;
  refreshToken: string | null;
} {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  return {
    type: hashParams.get("type"),
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
  };
}

export function setRecoveryMode(accessToken?: string | null) {
  sessionStorage.setItem(RECOVERY_MODE_KEY, "true");
  if (accessToken) sessionStorage.setItem(RECOVERY_ACCESS_TOKEN_KEY, accessToken);
}

export function clearRecoveryMode() {
  sessionStorage.removeItem(RECOVERY_MODE_KEY);
  sessionStorage.removeItem(RECOVERY_ACCESS_TOKEN_KEY);
}

export function isRecoveryMode(): boolean {
  return sessionStorage.getItem(RECOVERY_MODE_KEY) === "true";
}

export function getStoredRecoveryAccessToken(): string | null {
  return sessionStorage.getItem(RECOVERY_ACCESS_TOKEN_KEY);
}

/**
 * Fallback for recovery links where refresh_token is missing.
 * Uses the access token directly to call Auth updateUser.
 */
export async function updatePasswordWithAccessToken(params: {
  accessToken: string;
  password: string;
}) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error } = await client.auth.updateUser({ password: params.password });
  if (error) throw error;
}
