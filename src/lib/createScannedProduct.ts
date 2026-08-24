import { supabase } from "@/integrations/supabase/client";
import { resolveProductNameId } from "@/components/milk-test/hooks/product-registration/nameResolver";
import { createNewProduct } from "@/components/milk-test/hooks/product-registration/productCreator";
import { rememberBarcode } from "./rememberBarcode";
import { addProductFlavors } from "@/components/milk-test/hooks/product-registration/productFlavors";
import { addProductTypes } from "@/components/milk-test/hooks/product-registration/productTypes";
import { suggestFromScan, pickBoardName } from "./scanSuggestions";
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

/**
 * The board's own product names — the milk base, nothing else.
 */
const boardNames = async (): Promise<Array<{ id: string; name: string }>> => {
  const { data } = await supabase.from("names").select("id, name").order("name");
  return data ?? [];
};

export const createProductFromScan = async (
  scanned: ScannedProduct,
): Promise<CreatedProduct | null> => {
  if (!scanned.brand) return null;

  try {
    /**
     * The name has to be one the board already uses.
     *
     * This used to pass the carton's own name straight to
     * `resolveProductNameId`, which creates what it cannot find — so a
     * one-tap add wrote "OAT-LY! iKAFFE BARISTA EDITION" into `names`, beside
     * the "Oat" that every other Oatly product uses. Returning null instead
     * hands the reader to the registration form, which is the honest outcome
     * when the barcode did not say enough to fill it in.
     */
    const suggestion = suggestFromScan(scanned);
    const name = pickBoardName(suggestion.bases, (await boardNames()).map((n) => n.name));
    if (!name) return null;

    const brandId = await findOrCreateBrand(scanned.brand);
    if (!brandId) return null;

    const nameId = await resolveProductNameId(name, null);
    const productId = await createNewProduct(brandId, nameId, scanned.isBarista);

    // Properties and flavours the barcode stated. Neither is worth failing the
    // add over — the product exists and can be edited, and dropping it here
    // would leave the reader looking at a product that vanished.
    try {
      await addProductTypes(productId, suggestion.properties, scanned.isBarista);
      if (suggestion.flavors.length > 0) await addProductFlavors(productId, suggestion.flavors);
    } catch (error) {
      console.error("Could not add what the barcode said about the scanned product:", error);
    }

    // Record the barcode against what we just made, so this carton is an
    // exact hit for everyone after this.
    await rememberBarcode(scanned.barcode, productId);

    return { productId };
  } catch (error) {
    console.error("Could not add the scanned product:", error);
    return null;
  }
};
