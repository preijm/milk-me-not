import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveSecretKey } from "./secretKey";

/**
 * This module decides which credential an Edge Function runs as, so the cases
 * worth pinning are the fallbacks and, above all, that no log line ever carries
 * the key itself.
 *
 * `Deno` does not exist under vitest, so it is stubbed per test. The module
 * reads the environment inside the function rather than at import, which is
 * what makes that possible.
 */

const NEW_KEY = "sb_secret_pretendpretendpret_abcd1234";
const LEGACY_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.pretend.legacy";

const withEnv = (env: Record<string, string>) =>
  vi.stubGlobal("Deno", { env: { get: (name: string) => env[name] } });

describe("resolveSecretKey", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("prefers the new-format secret key", () => {
    withEnv({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: NEW_KEY }),
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    expect(resolveSecretKey()).toBe(NEW_KEY);
  });

  it("falls back to the legacy key when the new variable is absent", () => {
    withEnv({ SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY });
    expect(resolveSecretKey()).toBe(LEGACY_KEY);
  });

  it("falls back, loudly, when the bundle has no `default` entry", () => {
    withEnv({
      SUPABASE_SECRET_KEYS: JSON.stringify({ other: NEW_KEY }),
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    expect(resolveSecretKey()).toBe(LEGACY_KEY);
    expect(console.error).toHaveBeenCalled();
  });

  it("falls back, loudly, when the bundle is not valid JSON", () => {
    withEnv({
      SUPABASE_SECRET_KEYS: "not json",
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    expect(resolveSecretKey()).toBe(LEGACY_KEY);
    expect(console.error).toHaveBeenCalled();
  });

  it("throws rather than handing createClient an empty key", () => {
    withEnv({});
    expect(() => resolveSecretKey()).toThrow(/No Supabase secret key/);
  });

  // The reason the logging exists at all is to make the fallback visible, so it
  // would be an easy mistake to log the value beside the variable name.
  it("never logs the key itself", () => {
    withEnv({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: NEW_KEY }),
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    resolveSecretKey();
    withEnv({ SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY });
    resolveSecretKey();

    const logged = [
      ...vi.mocked(console.log).mock.calls,
      ...vi.mocked(console.error).mock.calls,
    ]
      .flat()
      .join(" ");

    expect(logged).not.toContain(NEW_KEY);
    expect(logged).not.toContain(LEGACY_KEY);
    expect(logged).toContain("SUPABASE_SECRET_KEYS");
  });
});
