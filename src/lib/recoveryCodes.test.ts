import { describe, it, expect, vi, beforeEach } from "vitest";
import { redeemRecoveryCode } from "./recoveryCodes";

const invoke = vi.hoisted(() => vi.fn());
const refreshSession = vi.hoisted(() => vi.fn(async () => ({})));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: () => {},
    functions: { invoke },
    auth: { refreshSession },
  },
}));

// What supabase-js hands back for a non-2xx reply: a FunctionsHttpError whose
// context is the Response.
const httpError = (status: number) => ({
  data: null,
  error: Object.assign(new Error("Edge Function returned a non-2xx status code"), {
    context: new Response("{}", { status }),
  }),
});

describe("redeemRecoveryCode", () => {
  beforeEach(() => {
    invoke.mockReset();
    refreshSession.mockClear();
  });

  it("is ok, and refreshes the session, when the function accepts the code", async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    expect(await redeemRecoveryCode("a1b2-c3d4-e5f6")).toBe("ok");
    expect(refreshSession).toHaveBeenCalled();
  });

  it("is limited on a 429", async () => {
    invoke.mockResolvedValue(httpError(429));
    expect(await redeemRecoveryCode("a1b2-c3d4-e5f6")).toBe("limited");
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("is invalid on any other error", async () => {
    invoke.mockResolvedValue(httpError(400));
    expect(await redeemRecoveryCode("ffff-ffff-ffff")).toBe("invalid");
    invoke.mockResolvedValue({ data: null, error: new Error("network down") });
    expect(await redeemRecoveryCode("ffff-ffff-ffff")).toBe("invalid");
  });
});
