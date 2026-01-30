import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { useProductRegistration } from "./ProductRegistrationContext";
import { BrandSelect } from "../BrandSelect";
import { FlavorSelector } from "../FlavorSelector";
import { BaristaToggle } from "../BaristaToggle";
import { ProductOptions } from "../ProductOptions";
import { NameSelect } from "../NameSelect";
import { Trash2, Coffee, Tag, Droplet } from "lucide-react";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: (e: React.MouseEvent) => void;
  onBrandInputReady?: (input: HTMLInputElement | null) => void;
  onDelete?: () => void;
}

export const ProductForm = forwardRef<HTMLInputElement, ProductFormProps>(({ onSubmit, onCancel, onBrandInputReady, onDelete }, ref) => {
  const {
    brandId,
    setBrandId,
    productName,
    setProductName,
    nameId,
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
    isAdmin,
    editProductId
  } = useProductRegistration();

  // Form validation logic
  const isFormValid = !!brandId && !!productName;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
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
            <Coffee className="w-4 h-4 text-amber-600" />
            Type
          </span>
          <BaristaToggle isBarista={isBarista} onToggle={setIsBarista} />
        </div>

        <div className="space-y-2">
          <span className="block font-medium text-foreground flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-600" />
            Properties
          </span>
          <ProductOptions
            selectedTypes={selectedProductTypes}
            setSelectedTypes={setSelectedProductTypes}
          />
        </div>

        <div className="space-y-2">
          <span className="block font-medium text-foreground flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-purple-600" />
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

      <div className="flex justify-between items-center pt-4">
        {/* Left side - Remove button for admins in edit mode */}
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
        
        {/* Right side - Cancel and Submit buttons */}
        <div className="flex space-x-2">
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
              : (isEditMode ? "Update Product" : "Register Product")
            }
          </Button>
        </div>
      </div>
    </form>
  );
});

ProductForm.displayName = "ProductForm";
