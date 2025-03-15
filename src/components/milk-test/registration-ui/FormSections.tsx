
import React from "react";
import { Separator } from "@/components/ui/separator";
import { BrandSelect } from "../BrandSelect";
import { NameSelect } from "../NameSelect";
import { BaristaToggle } from "../BaristaToggle";
import { ProductOptions } from "../ProductOptions";
import { FlavorSelector } from "../FlavorSelector";
import { useProductRegistration } from "./ProductRegistrationContext";

export const BrandSection = () => {
  const { brandId, setBrandId } = useProductRegistration();
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Brand *</h3>
      <BrandSelect brandId={brandId} setBrandId={setBrandId} />
    </div>
  );
};

export const ProductNameSection = () => {
  const { productName, setProductName, setNameId } = useProductRegistration();
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Product *</h3>
      <NameSelect 
        productName={productName} 
        setProductName={setProductName} 
        onNameIdChange={setNameId} 
      />
    </div>
  );
};

export const BaristaSection = () => {
  const { isBarista, setIsBarista } = useProductRegistration();
  
  return (
    <BaristaToggle 
      isBarista={isBarista} 
      onToggle={setIsBarista} 
    />
  );
};

export const PropertiesSection = () => {
  const { selectedProductTypes, setSelectedProductTypes } = useProductRegistration();
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Properties</h3>
      <ProductOptions 
        selectedTypes={selectedProductTypes} 
        setSelectedTypes={setSelectedProductTypes} 
      />
    </div>
  );
};

export const FlavorsSection = () => {
  const { flavors, selectedFlavors, handleFlavorToggle, refetchFlavors } = useProductRegistration();
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Flavors</h3>
      <FlavorSelector 
        flavors={flavors} 
        selectedFlavors={selectedFlavors} 
        onFlavorToggle={handleFlavorToggle}
        onAddNewFlavor={refetchFlavors}
      />
    </div>
  );
};

export const ProductForm: React.FC<{ onSubmit: (e: React.FormEvent) => Promise<any> }> = ({ onSubmit }) => {
  const { isSubmitting } = useProductRegistration();
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <BrandSection />
      
      <ProductNameSection />
      
      <Separator />
      
      <BaristaSection />
      
      <PropertiesSection />
      
      <Separator />
      
      <FlavorsSection />
      
      <DialogButtons isSubmitting={isSubmitting} />
    </form>
  );
};

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export const DialogButtons: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting }) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => window.history.back()}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="bg-black text-white"
      >
        {isSubmitting ? "Registering..." : "Register Product"}
      </Button>
    </DialogFooter>
  );
};
