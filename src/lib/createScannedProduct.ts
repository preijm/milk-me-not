import { supabase } from "@/integrations/supabase/client";
import { resolveProductNameId } from "@/components/milk-test/hooks/product-registration/nameResolver";
import { createNewProduct } from "@/components/milk-test/hooks/product-registration/productCreator";
import { rememberBarcode } from "./rememberBarcode";
import type { ScannedProduct } from "./openFoodFacts";

/**
 * Put a scanned carton on the board in one step.
 *
 * Scanning something nobody has rated used to open an empty registration form,
 * which is data entry wearing a scanner's clothes. Open Food Facts already
 * told us the brand and the name; the only thing left worth a person's
 * attention is confirming it, and that is a tap.
 *
 * The brand and name lookups reuse the registration flow's own resolvers
 * rather than inserting directly, so a scan cannot create a second "Alpro"
 * alongside the existing one, and both paths normalise names the same way.
 */

const findOrCreateBrand = async (name: string): Promise<string | null> => {
  const normalized = name.trim();
  if (!normalized) return null;

  const { data: existing } = await supabase
    .from("brands")
    .select("id")
    .ilike("name", normalized)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("brands")
    .insert({ name: normalized })
    .select("id")
    .single();
  if (error) {
    console.error("Could not add the scanned brand:", error);
    return null;
  }
  return created.id;
};

export type CreatedProduct = { productId: string };

export const createProductFromScan = async (
  scanned: ScannedProduct,
): Promise<CreatedProduct | null> => {
  if (!scanned.brand || !scanned.name) return null;

  try {
    const brandId = await findOrCreateBrand(scanned.brand);
    if (!brandId) return null;

    const nameId = await resolveProductNameId(scanned.name, null);
    const productId = await createNewProduct(brandId, nameId, scanned.isBarista);

    // Record the barcode against what we just made, so this carton is an
    // exact hit for everyone after this.
    await rememberBarcode(scanned.barcode, productId);

    return { productId };
  } catch (error) {
    console.error("Could not add the scanned product:", error);
    return null;
  }
};
