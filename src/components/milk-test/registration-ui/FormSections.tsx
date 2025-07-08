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
          <label htmlFor="brand" className="block font-medium text-gray-900">
            Brand <span className="text-red-500">*</span>
          </label>
          <div className="w-full">
            <BrandSelect
              brandId={brandId}
              setBrandId={setBrandId}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="product" className="block font-medium text-gray-900">
            Product <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Enter product name..."
            required
          />
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="space-y-2">
          <span className="block font-medium text-gray-900">Type</span>
          <BaristaToggle isBarista={isBarista} onToggle={setIsBarista} />
        </div>

        <div className="space-y-2">
          <span className="block font-medium text-gray-900">Properties</span>
          <ProductOptions
            selectedTypes={selectedProductTypes}
            setSelectedTypes={setSelectedProductTypes}
          />
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="space-y-2">
          <span className="block font-medium text-gray-900">Flavors</span>
          <FlavorSelector
            flavors={flavors}
            selectedFlavors={selectedFlavors}
            onFlavorToggle={handleFlavorToggle}
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
          variant="brand"
          disabled={!isFormValid || isSubmitting}
          className="px-4"
        >
          {isSubmitting ? "Registering..." : "Register Product"}
        </Button>
      </div>
    </form>
  );
};
