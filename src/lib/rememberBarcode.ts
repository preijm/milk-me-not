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
