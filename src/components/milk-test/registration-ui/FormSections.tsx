import React, { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProductRegistration } from "./ProductRegistrationContext";
import { BrandSelect } from "../BrandSelect";
import { FlavorSelector } from "../FlavorSelector";
import { BaristaToggle } from "../BaristaToggle";
import { ProductOptions } from "../ProductOptions";
import { NameSelect } from "../NameSelect";
import { BarcodeScanner } from "../BarcodeScanner";
import { StoryButton } from "@/components/story/primitives";
import { supabase } from "@/integrations/supabase/client";
import type { ScannedProduct } from "@/lib/openFoodFacts";
import { Trash2, Coffee, Tag, Droplet, ScanLine } from "lucide-react";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: (e: React.MouseEvent) => void;
  onBrandInputReady?: (input: HTMLInputElement | null) => void;
  onDelete?: () => void;
}

export const ProductForm = forwardRef<HTMLInputElement, ProductFormProps>(({ onSubmit, onCancel, onBrandInputReady, onDelete }, ref) => {
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | null>(null);
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
   * Fill the form in from a scanned carton.
   *
   * Open Food Facts gives a brand as text, and this form wants a brand id, so
   * the name is matched against the brands already on the board. An unknown
   * brand is left for the reader to add — the point is to save typing, not to
   * quietly invent records from a third-party database.
   */
  const applyScan = async (found: ScannedProduct) => {
    setScanning(false);
    if (found.name) setProductName(found.name);
    if (found.isBarista) setIsBarista(true);

    if (!found.brand) {
      setScanNote(found.name ? "Found the product. Pick its brand." : "Nothing on file — add it by hand.");
      return;
    }

    const { data } = await supabase
      .from("brands")
      .select("id, name")
      .ilike("name", found.brand)
      .maybeSingle();

    if (data?.id) {
      setBrandId(data.id);
      setScanNote(`Filled in from the barcode — check it before saving.`);
    } else {
      setScanNote(`Scanned "${found.brand}" — that brand is not on the board yet, so add it below.`);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {!isEditMode && (
          <div className="rounded-2xl bg-story-cream p-3.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StoryButton type="button" tone="outline" size="sm" onClick={() => setScanning(true)}>
                <ScanLine className="mr-2 h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">Scan barcode</span>
              </StoryButton>
              <p className="text-[0.8125rem] text-story-muted">or fill it in below</p>
            </div>
            {scanNote && <p className="mt-2 text-[0.8125rem] font-medium text-story-green-dark">{scanNote}</p>}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="brand" className="block font-medium text-foreground">
            Brand <span className="text-destructive">*</span>
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
          <label htmlFor="product" className="block font-medium text-foreground">
            Product <span className="text-destructive">*</span>
          </label>
          <NameSelect
            productName={productName}
            setProductName={setProductName}
            onNameIdChange={setNameId}
          />
        </div>

        <div className="space-y-2">
          <span className="block font-medium text-foreground flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-badge-barista" />
            Type
          </span>
          <BaristaToggle isBarista={isBarista} onToggle={setIsBarista} />
        </div>

        <div className="space-y-2">
          <span className="block font-medium text-foreground flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-badge-property" />
            Properties
          </span>
          <ProductOptions
            selectedTypes={selectedProductTypes}
            setSelectedTypes={setSelectedProductTypes}
          />
        </div>

        <div className="space-y-2">
          <span className="block font-medium text-foreground flex items-center gap-1.5">
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

      <BarcodeScanner open={scanning} onClose={() => setScanning(false)} onScan={applyScan} />

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
