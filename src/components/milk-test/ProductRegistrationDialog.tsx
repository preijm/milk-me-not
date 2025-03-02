
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandSelect } from "./BrandSelect";
import { ProductOptions } from "./ProductOptions";
import { IngredientsSelect } from "./IngredientsSelect";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HelpCircle, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

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
  const [productNameSuggestions, setProductNameSuggestions] = useState<string[]>([]);
  const [showProductNameDropdown, setShowProductNameDropdown] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [isBarista, setIsBarista] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddNewProductName, setShowAddNewProductName] = useState(false);
  
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setBrandId("");
      setProductName("");
      setIngredients([]);
      setNewIngredient("");
      setSelectedProductTypes([]);
      setIsBarista(false);
      setSelectedFlavors([]);
    }
  }, [open]);

  // Fetch all product names for suggestions
  const { data: allProductNames = [] } = useQuery({
    queryKey: ['product_names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_names')
        .select('name')
        .order('name');
        
      if (error) {
        console.error('Error fetching product names:', error);
        return [];
      }
      
      return data.map(item => item.name);
    },
  });

  // Fetch existing product names when brand changes
  useEffect(() => {
    const fetchProductNames = async () => {
      if (!brandId) {
        setProductNameSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('name')
        .eq('brand_id', brandId)
        .order('name');
        
      if (error) {
        console.error('Error fetching product names:', error);
        return;
      }
      
      const names = data.map(p => p.name);
      setProductNameSuggestions(names);
    };
    
    fetchProductNames();
  }, [brandId]);

  // Filter product suggestions based on input
  useEffect(() => {
    if (productName.trim() === '') {
      setShowProductNameDropdown(false);
      setShowAddNewProductName(false);
      return;
    }
    
    // Check if we need to show the "Add new" option
    const exactMatch = allProductNames.some(
      name => name.toLowerCase() === productName.trim().toLowerCase()
    );
    setShowAddNewProductName(!exactMatch && productName.trim() !== '');
    
    // Filter suggestions from all product names
    const filteredSuggestions = allProductNames.filter(name => 
      name.toLowerCase().includes(productName.toLowerCase()) &&
      !productNameSuggestions.includes(name)
    );
    
    const combinedSuggestions = [
      ...productNameSuggestions.filter(name => 
        name.toLowerCase().includes(productName.toLowerCase())
      ),
      ...filteredSuggestions
    ];
    
    setShowProductNameDropdown(combinedSuggestions.length > 0 || showAddNewProductName);
  }, [productName, productNameSuggestions, allProductNames]);

  // Fetch flavors
  const { data: flavors = [] } = useQuery({
    queryKey: ['flavors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flavors')
        .select('id, name')
        .order('ordering', { ascending: true });
      
      if (error) {
        console.error('Error fetching flavors:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleFlavorToggle = (flavorId: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavorId) 
        ? prev.filter(id => id !== flavorId)
        : [...prev, flavorId]
    );
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleSelectProductName = (name: string) => {
    setProductName(name);
    setShowProductNameDropdown(false);
  };

  const handleAddNewProductName = async () => {
    if (productName.trim() === '') return;

    // Add to product_names if it doesn't exist
    const { data, error } = await supabase
      .from('product_names')
      .insert({ name: productName.trim() })
      .select()
      .single();

    if (error) {
      console.error('Error adding product name:', error);
      toast({
        title: "Error",
        description: "Failed to add new product name. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "New product name added to the database.",
    });
    
    setShowProductNameDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandId) {
      toast({
        title: "Missing brand",
        description: "Please select a brand for this product",
        variant: "destructive",
      });
      return;
    }
    
    if (!productName) {
      toast({
        title: "Missing product name",
        description: "Please enter a name for this product",
        variant: "destructive",
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
          description: "This product already exists and has been selected",
        });
        onSuccess(existingProduct.id, brandId);
        onOpenChange(false);
        setIsSubmitting(false);
        return;
      }
      
      // First, add the product name to product_names table if it doesn't exist
      let productNameId: string | undefined;
      
      const { data: existingProductName } = await supabase
        .from('product_names')
        .select('id')
        .eq('name', productName.trim())
        .maybeSingle();
        
      if (existingProductName) {
        productNameId = existingProductName.id;
      } else {
        const { data: newProductName, error: productNameError } = await supabase
          .from('product_names')
          .insert({ name: productName.trim() })
          .select()
          .single();
          
        if (productNameError) {
          console.error('Error adding product name:', productNameError);
          // Continue even if product name addition fails
        } else {
          productNameId = newProductName.id;
        }
      }
      
      // If barista is selected, add it to product types
      const finalProductTypes = isBarista 
        ? [...selectedProductTypes, "barista"] 
        : selectedProductTypes;
      
      // Create the new product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: productName.trim(),
          brand_id: brandId,
          ingredients: ingredients.length > 0 ? ingredients : null,
          product_types: finalProductTypes.length > 0 ? finalProductTypes : null,
          product_name_id: productNameId
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
        description: "Your new product has been registered successfully",
      });
      
      onSuccess(newProduct.id, brandId);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to register the product. Please try again.",
        variant: "destructive",
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
                <TooltipContent side="right" className="max-w-xs">
                  <p>Enter product details to add a new product to the database. Brand and product name are required. Product types, ingredients, and flavors are optional but helpful for filtering and searches.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Brand *</h3>
            <BrandSelect
              brandId={brandId}
              setBrandId={setBrandId}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product Name *</h3>
            <div className="relative">
              <Input
                placeholder="Enter product name"
                value={productName}
                onChange={handleProductNameChange}
                onFocus={() => setShowProductNameDropdown(
                  (productNameSuggestions.length > 0 || 
                   allProductNames.some(name => name.toLowerCase().includes(productName.toLowerCase())))
                )}
              />
              
              {showProductNameDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {[...new Set([
                    ...productNameSuggestions.filter(name => 
                      name.toLowerCase().includes(productName.toLowerCase())
                    ),
                    ...allProductNames.filter(name => 
                      name.toLowerCase().includes(productName.toLowerCase()) && 
                      !productNameSuggestions.includes(name)
                    )
                  ])].map((name) => (
                    <div
                      key={name}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProductName(name);
                      }}
                    >
                      {name}
                    </div>
                  ))}
                  
                  {showAddNewProductName && (
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-700"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddNewProductName();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add "{productName.trim()}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Barista Version</h3>
            <div className="flex items-center space-x-2">
              <Switch 
                id="barista-version"
                checked={isBarista}
                onCheckedChange={setIsBarista}
              />
              <Label htmlFor="barista-version">This is a Barista product</Label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product Type</h3>
            <ProductOptions
              selectedTypes={selectedProductTypes}
              setSelectedTypes={setSelectedProductTypes}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Ingredients</h3>
            <IngredientsSelect
              ingredients={ingredients}
              setIngredients={setIngredients}
              allIngredients={allIngredients}
              setAllIngredients={setAllIngredients}
              newIngredient={newIngredient}
              setNewIngredient={setNewIngredient}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Flavors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {flavors.map((flavor) => (
                <div key={flavor.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`flavor-${flavor.id}`}
                    checked={selectedFlavors.includes(flavor.id)}
                    onCheckedChange={() => handleFlavorToggle(flavor.id)}
                  />
                  <Label htmlFor={`flavor-${flavor.id}`}>{flavor.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-cream-300 hover:bg-cream-200 text-milk-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
