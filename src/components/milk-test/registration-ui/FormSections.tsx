import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProductRegistration } from "./ProductRegistrationContext";
import { BrandSelect } from "../BrandSelect";
import { FlavorSelector } from "../FlavorSelector";
import { BaristaToggle } from "../BaristaToggle";
import { ProductOptions } from "../ProductOptions";
import { NameSelect } from "../NameSelect";
import { supabase } from "@/integrations/supabase/client";
import type { ScannedProduct } from "@/lib/openFoodFacts";
import { Trash2, Coffee, Tag, Droplet } from "lucide-react";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: (e: React.MouseEvent) => void;
  onBrandInputReady?: (input: HTMLInputElement | null) => void;
  onDelete?: () => void;
}

export const ProductForm = forwardRef<HTMLInputElement, ProductFormProps>(({ onSubmit, onCancel, onBrandInputReady, onDelete }, ref) => {
  const [scanNote, setScanNote] = useState<string | null>(null);
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
    isSubmitting,
    refetchFlavors,
    isEditMode,
    isAdmin
  } = useProductRegistration();

  // Form validation logic
  const isFormValid = !!brandId && !!productName;

  /**
   * Fill the form in from a carton scanned on the way here.
   *
   * The scan flow sends the reader here when the board has nothing for that
   * barcode, so the details Open Food Facts knows arrive with them. There is no
   * scan button on this form itself: you only reach it after searching and not
   * finding the product, by which point you have already typed its name.
   *
   * Open Food Facts gives a brand as text and this form wants a brand id, so
   * the name is matched against brands already on the board. An unknown brand
   * is left for the reader to add rather than invented from a third-party
   * database.
   */
  useEffect(() => {
    const scanned = (location.state as { scanned?: ScannedProduct } | null)?.scanned;
    if (!scanned || isEditMode || appliedScan.current) return;
    appliedScan.current = true;

    if (scanned.name) setProductName(scanned.name);
    if (scanned.isBarista) setIsBarista(true);

    if (!scanned.brand) {
      setScanNote("Filled in from the barcode. Pick a brand to finish.");
      return;
    }

    void supabase
      .from("brands")
      .select("id")
      .ilike("name", scanned.brand)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) {
          setBrandId(data.id);
          setScanNote("Filled in from the barcode — check it before saving.");
        } else {
          setScanNote(`Scanned "${scanned.brand}", which is not on the board yet. Add it below.`);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isEditMode]);

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
