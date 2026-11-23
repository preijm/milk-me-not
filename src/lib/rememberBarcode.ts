import { supabase } from "@/integrations/supabase/client";

/**
 * Record which product a scanned barcode belongs to.
 *
 * Always awaited, and never fired off with `void`: a postgrest builder is a
 * lazy thenable that only issues its request from inside `then()`, so
 * `void supabase.rpc(...)` builds a request and drops it on the floor. That is
 * exactly how picking a product from the match list taught the board nothing,
 * and the next scan of the same carton asked the same question again.
 *
 * `remember_product_barcode` grants EXECUTE to `authenticated` only, so a
 * signed-out scan cannot record anything. That is deliberate — it is logged
 * rather than surfaced, because the reader still gets to the product either
 * way.
 */
export const rememberBarcode = async (barcode: string, productId: string): Promise<void> => {
  const { error } = await supabase.rpc("remember_product_barcode", {
    _barcode: barcode,
    _product_id: productId,
  });
  if (error) {
    console.error("Could not remember the scanned barcode:", error);
  }
};

/**
 * The barcode a scan brought along in router state, or nothing.
 *
 * The scan flow hands the registration form a whole `ScannedProduct` through
 * `navigate(..., { state: { scanned } })`. Router state is whatever the last
 * navigation put there, so this checks the shape rather than trusting a cast —
 * and the barcode's own shape too, because `remember_product_barcode` silently
 * ignores anything that is not 8 to 14 digits.
 */
export const scannedBarcodeFrom = (state: unknown): string | null => {
  if (!state || typeof state !== "object") return null;
  const scanned = (state as { scanned?: unknown }).scanned;
  if (!scanned || typeof scanned !== "object") return null;
  const barcode = (scanned as { barcode?: unknown }).barcode;
  return isBarcode(barcode) ? barcode : null;
};

/**
 * Whether something is a barcode the database will store: 8 to 14 digits.
 *
 * The same pattern `remember_product_barcode` and `admin_set_product_barcode`
 * check, so the app can refuse it before a round trip — and, for the scan,
 * before the database silently ignores it.
 */
export const isBarcode = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9]{8,14}$/.test(value);
