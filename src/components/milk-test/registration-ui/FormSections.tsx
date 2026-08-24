import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useProductRegistration } from "./ProductRegistrationContext";
import { BrandSelect } from "../BrandSelect";
import { FlavorSelector } from "../FlavorSelector";
import { BaristaToggle } from "../BaristaToggle";
import { ProductOptions } from "../ProductOptions";
import { NameSelect } from "../NameSelect";
import { supabase } from "@/integrations/supabase/client";
import type { ScannedProduct } from "@/lib/openFoodFacts";
import { suggestFromScan, pickBoardName } from "@/lib/scanSuggestions";
import { Trash2, Coffee, Tag, Droplet } from "lucide-react";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: (e: React.MouseEvent) => void;
  onBrandInputReady?: (input: HTMLInputElement | null) => void;
  onDelete?: () => void;
}

export const ProductForm = forwardRef<HTMLInputElement, ProductFormProps>(({ onSubmit, onCancel, onBrandInputReady, onDelete }, ref) => {
  const [scanNote, setScanNote] = useState<string | null>(null);
  const [scannedBrand, setScannedBrand] = useState<string | undefined>(undefined);
  const location = useLocation();
  const appliedScan = useRef(false);
  const {
    brandId,
    setBrandId,
    productName,
    setProductName,
    setNameId,
    selectedProductTypes,
    setSelectedProductTypes,
    isBarista,
    setIsBarista,
    selectedFlavors,
    handleFlavorToggle,
    flavors = [],
    flavorQuery,
    isSubmitting,
    refetchFlavors,
    isEditMode,
    isAdmin
  } = useProductRegistration();

  // Same key NameSelect uses, so this shares its cache rather than fetching
  // the list a second time.
  const { data: boardNames } = useQuery({
    queryKey: ['product_names'],
    queryFn: async () => {
      const { data } = await supabase.from('names').select('id, name').order('name');
      return data || [];
    },
  });

  const { data: boardProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('ordering', { ascending: true });
      return data || [];
    },
  });

  // Form validation logic
  const isFormValid = !!brandId && !!productName;

  /**
   * Fill the form in from a carton scanned on the way here.
   *
   * The scan flow sends the reader here when the board has nothing for that
   * barcode, so what Open Food Facts knows arrives with them and this form is
   * a confirmation rather than a blank page. Filling a blank form while
   * standing in a shop is the thing that stops people bothering.
   *
   * Every field below is a suggestion sitting on a control the reader can see
   * and change. Nothing here is invented: a name is only ever one the board
   * already uses, and a property or flavour is only ever a key that exists.
   *
   * It waits for the board's own vocabulary before applying anything, because
   * a suggestion checked against an empty list would silently be no suggestion
   * at all.
   */
  useEffect(() => {
    const scanned = (location.state as { scanned?: ScannedProduct } | null)?.scanned;
    if (!scanned || isEditMode || appliedScan.current) return;
    // Settled, not merely non-empty: a flavour list that came back empty or
    // failed should cost the scan its flavour badge, not the whole prefill.
    if (!boardNames || !boardProperties || !flavorQuery?.isFetched) return;
    appliedScan.current = true;

    const suggestion = suggestFromScan(scanned);
    const filled: string[] = [];

    // The board names a product by its milk base — "Oat", not "OAT-LY! iKAFFE
    // BARISTA EDITION". Writing the carton's own name here used to add a row
    // to `names` that nobody would ever pick again.
    const name = pickBoardName(suggestion.bases, boardNames.map((n) => n.name));
    if (name) {
      const match = boardNames.find((n) => n.name === name);
      setProductName(name);
      if (match) setNameId(match.id);
      filled.push("the milk");
    }

    if (scanned.isBarista) {
      setIsBarista(true);
      filled.push("barista");
    }

    const properties = suggestion.properties.filter((key) =>
      boardProperties.some((p) => p.key === key),
    );
    if (properties.length > 0) {
      setSelectedProductTypes(properties);
      filled.push(properties.length === 1 ? "a property" : "some properties");
    }

    const flavorKeys = suggestion.flavors.filter((key) => flavors.some((f) => f.key === key));
    flavorKeys.forEach(handleFlavorToggle);
    if (flavorKeys.length > 0) filled.push("a flavour");

    /**
     * Say what was actually filled in.
     *
     * The old copy claimed "filled in from the barcode" even when the scan had
     * found nothing at all, which left the reader hunting the form for a field
     * that was never touched.
     */
    const announce = (unknownBrand: string | null) => {
      const list =
        filled.length === 0 ? null
        : filled.length === 1 ? filled[0]
        : `${filled.slice(0, -1).join(", ")} and ${filled[filled.length - 1]}`;

      if (unknownBrand) {
        setScanNote(
          list
            ? `Scanned ${unknownBrand}, which is not on the board yet — add it above. We filled in ${list} from the barcode; check it before saving.`
            : `Scanned ${unknownBrand}, which is not on the board yet — add it above, then fill in the rest.`,
        );
      } else if (list) {
        setScanNote(`Filled in ${list} from the barcode — check it before saving.`);
      } else {
        setScanNote("Scanned, but the barcode told us nothing about this carton. Over to you.");
      }
    };

    if (!scanned.brand) {
      announce(null);
      return;
    }

    /**
     * Open Food Facts gives a brand as text and this form wants an id.
     *
     * `ilike` with no wildcards is an exact, case-insensitive match, and the
     * first row is taken rather than `maybeSingle` — two brands differing only
     * in case would make that error out and fill in nothing at all.
     *
     * An unmatched brand is not invented. It is typed into the field instead,
     * where the form's own "add this brand" affordance is already waiting, so
     * the reader confirms rather than retypes.
     */
    const brand = scanned.brand;
    void supabase
      .from("brands")
      .select("id")
      .ilike("name", brand)
      .limit(1)
      .then(({ data }) => {
        const found = data?.[0];
        if (found) {
          setBrandId(found.id);
          filled.unshift("the brand");
        } else {
          setScannedBrand(brand);
        }
        announce(found ? null : brand);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isEditMode, boardNames, boardProperties, flavorQuery?.isFetched]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {scanNote && (
          <p className="rounded-2xl bg-story-green-wash px-3.5 py-2.5 text-[0.8125rem] font-medium text-story-green-dark">
            {scanNote}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="brand" className="block text-[0.8125rem] font-bold text-story-ink-2">
            Brand <span className="text-error">*</span>
          </label>
          <div className="w-full">
            <BrandSelect
              ref={ref}
              brandId={brandId}
              setBrandId={setBrandId}
              defaultBrand={scannedBrand}
              onInputReady={onBrandInputReady}
              autoFocus={!isEditMode}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="product" className="block text-[0.8125rem] font-bold text-story-ink-2">
            Product <span className="text-error">*</span>
          </label>
          <NameSelect
            productName={productName}
            setProductName={setProductName}
            onNameIdChange={setNameId}
          />
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-ink-2">
            <Coffee className="w-4 h-4 text-badge-barista" />
            Type
          </span>
          <BaristaToggle isBarista={isBarista} onToggle={setIsBarista} />
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-ink-2">
            <Tag className="w-4 h-4 text-badge-property" />
            Properties
          </span>
          <ProductOptions
            selectedTypes={selectedProductTypes}
            setSelectedTypes={setSelectedProductTypes}
          />
        </div>

        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-ink-2">
            <Droplet className="w-4 h-4 text-badge-flavor" />
            Flavors
          </span>
          <FlavorSelector
            flavors={flavors}
            selectedFlavors={selectedFlavors}
            onFlavorToggle={handleFlavorToggle}
            refetchFlavors={refetchFlavors}
          />
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 pt-4">
        {/* Remove button for admins in edit mode */}
        <div>
          {isEditMode && isAdmin && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="px-4"
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
        
        {/* Cancel and Submit buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel(e);
            }}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={!isFormValid || isSubmitting}
            className="px-4"
          >
            {isSubmitting 
              ? (isEditMode ? "Updating..." : "Registering...")
              : (isEditMode ? (<><span className="sm:hidden">Update</span><span className="hidden sm:inline">Update Product</span></>) : "Register Product")
            }
          </Button>
        </div>
      </div>
    </form>
  );
});

ProductForm.displayName = "ProductForm";
