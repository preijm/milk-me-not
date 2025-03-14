
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrandSelect } from "./BrandSelect";
import { NameSelect } from "./NameSelect";
import { ProductOptions } from "./ProductOptions";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ProductRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productId: string, brandId: string) => void;
}

export const ProductRegistrationDialog = ({
  open,
  onOpenChange,
  onSuccess
}: ProductRegistrationDialogProps) => {
  // Form state
  const [brandId, setBrandId] = useState("");
  const [productName, setProductName] = useState("");
  const [nameId, setNameId] = useState<string | null>(null);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [isBarista, setIsBarista] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setBrandId("");
      setProductName("");
      setNameId(null);
      setSelectedProductTypes([]);
      setIsBarista(false);
      setSelectedFlavors([]);
    }
  }, [open]);

  // Fetch product_flavors
  const { data: flavors = [] } = useQuery({
    queryKey: ['product_flavors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flavors')
        .select('id, name')
        .order('ordering', { ascending: true });
        
      if (error) {
        console.error('Error fetching product flavors:', error);
        throw error;
      }
      return data || [];
    }
  });

  const handleFlavorToggle = (flavorId: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavorId) 
        ? prev.filter(id => id !== flavorId) 
        : [...prev, flavorId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) {
      toast({
        title: "Missing brand",
        description: "Please select a brand for this product",
        variant: "destructive"
      });
      return;
    }
    if (!productName) {
      toast({
        title: "Missing product name",
        description: "Please enter a name for this product",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // First check if product already exists with this name and brand
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', productName.trim())
        .eq('brand_id', brandId)
        .maybeSingle();
        
      if (existingProduct) {
        // If product exists, select it instead of showing an error
        toast({
          title: "Product exists",
          description: "This product already exists and has been selected"
        });
        onSuccess(existingProduct.id, brandId);
        onOpenChange(false);
        setIsSubmitting(false);
        return;
      }

      // If name doesn't exist yet, create it
      let finalNameId = nameId;
      if (!finalNameId) {
        const { data: newName, error: nameError } = await supabase
          .from('names')
          .insert({ name: productName.trim() })
          .select()
          .single();
          
        if (nameError) {
          console.error('Error adding product name:', nameError);
          // Continue even if name addition fails
        } else {
          finalNameId = newName.id;
        }
      }

      // If barista is selected, add it to product properties
      const finalProductProperties = isBarista 
        ? [...selectedProductTypes, "barista"] 
        : selectedProductTypes;

      // Create the new product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: productName.trim(),
          brand_id: brandId,
          name_id: finalNameId,
          product_types: finalProductProperties.length > 0 ? finalProductProperties : null
        })
        .select()
        .single();
        
      if (productError) {
        throw productError;
      }

      // Add flavors if selected
      if (selectedFlavors.length > 0) {
        const flavorLinks = selectedFlavors.map(flavorId => ({
          product_id: newProduct.id,
          flavor_id: flavorId
        }));
        
        const { error: flavorError } = await supabase
          .from('product_flavors')
          .insert(flavorLinks);
          
        if (flavorError) {
          console.error('Error adding flavors:', flavorError);
          // Continue even if flavor addition fails
        }
      }
      
      toast({
        title: "Product added",
        description: "Your new product has been registered successfully"
      });
      
      onSuccess(newProduct.id, brandId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to register the product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Register New Product
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center" className="max-w-xs">
                  <p className="font-normal">Enter product details to add a new product to the database. Brand and product name are required. Product types and flavors are optional but helpful for filtering and searches.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Brand *</h3>
            <BrandSelect brandId={brandId} setBrandId={setBrandId} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product Name *</h3>
            <NameSelect 
              productName={productName} 
              setProductName={setProductName} 
              onNameIdChange={setNameId}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Barista Version</h3>
            <div className="flex items-center">
              <Switch id="barista-version" checked={isBarista} onCheckedChange={setIsBarista} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product Type</h3>
            <ProductOptions selectedTypes={selectedProductTypes} setSelectedTypes={setSelectedProductTypes} />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Flavors</h3>
            <div className="flex flex-wrap gap-2">
              {flavors.map(flavor => (
                <Badge 
                  key={flavor.id} 
                  variant="outline" 
                  className={`
                    rounded-full px-4 py-1 text-gray-700 cursor-pointer 
                    ${selectedFlavors.includes(flavor.id) 
                      ? 'bg-cream-200 border-cream-300' 
                      : 'bg-gray-100 hover:bg-gray-200 border-gray-200'}
                  `}
                  onClick={() => handleFlavorToggle(flavor.id)}
                >
                  {flavor.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-black text-white">
              {isSubmitting ? "Registering..." : "Register Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
