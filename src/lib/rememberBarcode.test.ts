import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The mock mirrors the one thing about postgrest-js that broke this: its
 * builder is a lazy thenable. Nothing is sent until something calls `then`, so
 * a caller that fires the builder off with `void` sends no request at all.
 * `sent` therefore only goes up when the barcode genuinely reaches the server.
 */
let sent = 0;
let failWith: { message: string } | null = null;

const rpc = vi.fn((_fn: string, _args: unknown) => ({
  then(onfulfilled: (value: { error: { message: string } | null }) => unknown) {
    sent += 1;
    return Promise.resolve({ error: failWith }).then(onfulfilled);
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...args: [string, unknown]) => rpc(...args) },
}));

const { rememberBarcode, scannedBarcodeFrom } = await import("./rememberBarcode");

describe("scannedBarcodeFrom", () => {
  it("reads the barcode a scan put in router state", () => {
    expect(scannedBarcodeFrom({ scanned: { barcode: "5411188127697", brand: "Alpro" } })).toBe(
      "5411188127697",
    );
  });

  it("finds nothing when the form was reached without a scan", () => {
    expect(scannedBarcodeFrom(null)).toBeNull();
    expect(scannedBarcodeFrom(undefined)).toBeNull();
    expect(scannedBarcodeFrom({})).toBeNull();
    // Another page's state, which is what router state is after most navigations.
    expect(scannedBarcodeFrom({ selectedProductId: "p1" })).toBeNull();
  });

  it("refuses anything the database would silently ignore", () => {
    expect(scannedBarcodeFrom({ scanned: { barcode: "" } })).toBeNull();
    expect(scannedBarcodeFrom({ scanned: { barcode: "1234567" } })).toBeNull();
    expect(scannedBarcodeFrom({ scanned: { barcode: "541118812769x" } })).toBeNull();
    expect(scannedBarcodeFrom({ scanned: { barcode: 5411188127697 } })).toBeNull();
    expect(scannedBarcodeFrom({ scanned: "5411188127697" })).toBeNull();
  });
});

describe("rememberBarcode", () => {
  beforeEach(() => {
    sent = 0;
    failWith = null;
    rpc.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("actually sends the request rather than building one and dropping it", async () => {
    await rememberBarcode("8712800147008", "prod-1");

    expect(sent).toBe(1);
    expect(rpc).toHaveBeenCalledWith("remember_product_barcode", {
      _barcode: "8712800147008",
      _product_id: "prod-1",
    });
  });

  it("logs a refusal instead of throwing, so a signed-out scan still reaches the product", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    failWith = { message: "permission denied for function remember_product_barcode" };

    await expect(rememberBarcode("8712800147008", "prod-1")).resolves.toBeUndefined();
    expect(logged).toHaveBeenCalled();
  });
});
