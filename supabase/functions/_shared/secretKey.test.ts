import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveSecretKey } from "./secretKey";

/**
 * This module decides which credential an Edge Function runs as. The cases
 * worth pinning are that the legacy key is genuinely ignored, that every
 * unusable state throws rather than limping on, and above all that no log line
 * or error message ever carries the key itself.
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

  it("uses the new-format secret key", () => {
    withEnv({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: NEW_KEY }),
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    expect(resolveSecretKey()).toBe(NEW_KEY);
  });

  // The legacy keys were disabled on 2026-11-26 and answer 401. Falling back to
  // one would turn a boot error that names the fix into a 401 deep inside an
  // admin call, so the variable is ignored even when it is sitting right there.
  it("ignores the legacy key rather than falling back to it", () => {
    withEnv({ SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY });
    expect(() => resolveSecretKey()).toThrow();
  });

  it("throws when the bundle is the empty object a keyless project has", () => {
    withEnv({ SUPABASE_SECRET_KEYS: "{}", SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY });
    expect(() => resolveSecretKey()).toThrow(/no usable `default` entry/);
  });

  it("throws when the bundle has some other key but no `default`", () => {
    withEnv({ SUPABASE_SECRET_KEYS: JSON.stringify({ billing: NEW_KEY }) });
    expect(() => resolveSecretKey()).toThrow(/no usable `default` entry/);
  });

  it("throws when the bundle is not valid JSON", () => {
    withEnv({ SUPABASE_SECRET_KEYS: "not json" });
    expect(() => resolveSecretKey()).toThrow(/not valid JSON/);
  });

  it("throws when nothing is set at all", () => {
    withEnv({});
    expect(() => resolveSecretKey()).toThrow(/is not set/);
  });

  // The error is the only thing anyone gets when a function fails to boot, so
  // it has to carry the fix rather than just the symptom.
  it("names the fix, and says the legacy key is not a way out", () => {
    withEnv({ SUPABASE_SECRET_KEYS: "{}" });

    let message = "";
    try {
      resolveSecretKey();
    } catch (err) {
      message = (err as Error).message;
    }

    expect(message).toMatch(/secret key named `default`/);
    expect(message).toMatch(/redeploy/);
    expect(message).toMatch(/SUPABASE_SERVICE_ROLE_KEY is not a fallback/);
  });

  // The reason the logging exists at all is to make the resolved key visible,
  // so it would be an easy mistake to log the value beside the variable name.
  // The thrown messages are just as public, so they are checked too.
  it("never reveals the key itself, in a log line or an error", () => {
    withEnv({
      SUPABASE_SECRET_KEYS: JSON.stringify({ default: NEW_KEY }),
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    resolveSecretKey();

    let thrown = "";
    withEnv({
      SUPABASE_SECRET_KEYS: JSON.stringify({ billing: NEW_KEY }),
      SUPABASE_SERVICE_ROLE_KEY: LEGACY_KEY,
    });
    try {
      resolveSecretKey();
    } catch (err) {
      thrown = (err as Error).message;
    }

    const said = [
      ...vi.mocked(console.log).mock.calls,
      ...vi.mocked(console.error).mock.calls,
    ]
      .flat()
      .join(" ")
      .concat(" ", thrown);

    expect(said).not.toContain(NEW_KEY);
    expect(said).not.toContain(LEGACY_KEY);
    expect(said).toContain("SUPABASE_SECRET_KEYS");
  });
});
