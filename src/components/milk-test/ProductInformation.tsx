
import React, { useState } from "react";
import { BrandSelect } from "./BrandSelect";
import { ProductSelect } from "./ProductSelect";
import { BarcodeScanner } from "./BarcodeScanner";
import { BarcodeResultDialog } from "./BarcodeResultDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface ProductInformationProps {
  brandId: string;
  setBrandId: (id: string) => void;
  productId: string;
  setProductId: (id: string) => void;
}

export const ProductInformation = ({
  brandId,
  setBrandId,
  productId,
  setProductId,
}: ProductInformationProps) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [scannedBrandName, setScannedBrandName] = useState("");
  const [scannedProductName, setScannedProductName] = useState("");
  const [productUrl, setProductUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScanBarcode = () => {
    setIsScannerOpen(true);
  };

  const handleBarcodeScan = async (barcodeData: string) => {
    setIsScannerOpen(false);
    setIsLoading(true);
    setIsResultDialogOpen(true);
    
    try {
      // Fetch product data from Open Food Facts API
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeData}.json`);
      const data = await response.json();
      
      console.log("Open Food Facts API response:", data);
      
      if (data.status === 1 && data.product) {
        const brandName = data.product.brands || "Unknown brand";
        const productName = data.product.product_name || "Unknown product";
        const url = `https://world.openfoodfacts.org/product/${barcodeData}`;
        
        setScannedBrandName(brandName);
        setScannedProductName(productName);
        setProductUrl(url);
        
        toast({
          title: "Product Found",
          description: `Found: ${brandName} - ${productName}`,
        });
      } else {
        setScannedBrandName("");
        setScannedProductName("");
        setProductUrl(undefined);
        
        toast({
          title: "Product Not Found",
          description: "No product information found for this barcode.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      toast({
        title: "API Error",
        description: "Failed to get product information.",
        variant: "destructive",
      });
      
      setScannedBrandName("");
      setScannedProductName("");
      setProductUrl(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProduct = async (brandName: string, productName: string) => {
    try {
      // Check if brand exists
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandName)
        .maybeSingle();
      
      let brandId;
      
      if (existingBrand) {
        // Use existing brand
        brandId = existingBrand.id;
      } else {
        // Create new brand
        const { data: newBrand, error: brandError } = await supabase
          .from('brands')
          .insert({ name: brandName })
          .select()
          .single();
        
        if (brandError) throw brandError;
        brandId = newBrand.id;
      }
      
      // Update brand ID
      setBrandId(brandId);
      
      // Check if product exists for this brand
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', productName)
        .eq('brand_id', brandId)
        .maybeSingle();
      
      if (existingProduct) {
        // Use existing product
        setProductId(existingProduct.id);
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({ 
            name: productName,
            brand_id: brandId
          })
          .select()
          .single();
        
        if (productError) throw productError;
        setProductId(newProduct.id);
      }
      
      toast({
        title: "Success",
        description: "Product information updated.",
      });
    } catch (error) {
      console.error("Error saving product information:", error);
      toast({
        title: "Error",
        description: "Failed to save product information.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-4">
          <BrandSelect 
            brandId={brandId} 
            setBrandId={setBrandId}
          />
          <ProductSelect
            brandId={brandId}
            productId={productId}
            setProductId={setProductId}
          />
        </div>
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-shrink-0 h-full min-h-20"
          onClick={handleScanBarcode}
          type="button"
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
      
      <BarcodeScanner 
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
      
      <BarcodeResultDialog
        open={isResultDialogOpen}
        onClose={() => setIsResultDialogOpen(false)}
        brandName={scannedBrandName}
        productName={scannedProductName}
        productUrl={productUrl}
        onConfirm={handleConfirmProduct}
        isLoading={isLoading}
      />
    </div>
  );
};
