
import React from "react";
import { Button } from "@/components/ui/button";
import { useProductRegistration } from "./ProductRegistrationContext";
import { BrandSelect } from "../BrandSelect";
import { FlavorSelector } from "../FlavorSelector";
import { BaristaToggle } from "../BaristaToggle";
import { ProductOptions } from "../ProductOptions";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: (e: React.MouseEvent) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel }) => {
  const {
    brandId,
    setBrandId,
    productName,
    setProductName,
    selectedProductTypes,
    setSelectedProductTypes,
    isBarista,
    setIsBarista,
    selectedFlavors,
    handleFlavorToggle,
    flavors = [],
    isSubmitting
  } = useProductRegistration();

  // Form validation logic
  const isFormValid = !!brandId && !!productName;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="brand" className="block font-medium">
            Brand <span className="text-red-500">*</span>
          </label>
          <BrandSelect
            value={brandId}
            onChange={setBrandId}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="product" className="block font-medium">
            Product <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter product name..."
            required
          />
        </div>

        <hr className="my-4" />

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Barista</span>
            <BaristaToggle checked={isBarista} onCheckedChange={setIsBarista} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="block font-medium">Properties</span>
          <ProductOptions
            selectedOptions={selectedProductTypes}
            setSelectedOptions={setSelectedProductTypes}
          />
        </div>

        <hr className="my-4" />

        <div className="space-y-2">
          <span className="block font-medium">Flavors</span>
          <FlavorSelector
            flavors={flavors}
            selectedFlavors={selectedFlavors}
            onToggle={handleFlavorToggle}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="px-4 bg-cream-300 hover:bg-cream-200 text-milk-500"
        >
          {isSubmitting ? "Registering..." : "Register Product"}
        </Button>
      </div>
    </form>
  );
};
