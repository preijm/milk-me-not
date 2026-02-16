
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, ArrowRight } from "lucide-react";
import { normalizeName, findClosestMatch } from "@/lib/nameNormalization";

interface ProductSelectProps {
  brandId: string;
  productId: string;
  setProductId: (id: string) => void;
}

interface ProductWithName {
  id: string;
  name: string;
}

export const ProductSelect = ({ brandId, productId, setProductId }: ProductSelectProps) => {
  const [suggestions, setSuggestions] = useState<ProductWithName[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [closeMatch, setCloseMatch] = useState<ProductWithName | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      console.log('Fetching products for brand:', brandId);
      
      // Join products with names to get the product name
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, 
          names!inner(name)
        `)
        .eq('brand_id', brandId)
        .order('created_at');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      // Transform the data to the expected format
      const productsWithNames: ProductWithName[] = data.map(product => ({
        id: product.id,
        name: product.names.name
      }));
      
      console.log('Fetched products:', productsWithNames);
      return productsWithNames;
    },
    enabled: !!brandId,
  });

  // Update input value when product changes
  useEffect(() => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setInputValue(product.name);
      }
    } else if (products.length === 0 || !productId) {
      setInputValue("");
    }
  }, [productId, products]);

  // Clear product selection if brand changes
  useEffect(() => {
    setProductId("");
    setInputValue("");
  }, [brandId, setProductId]);

  useEffect(() => {
    if (!brandId || inputValue.trim() === '') {
      setSuggestions([]);
      setShowAddNew(false);
      setCloseMatch(null);
      return;
    }

    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    setSuggestions(filteredProducts);
    
    // Check if exact match (case-insensitive)
    const exactMatch = products.find(
      product => product.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    
    if (exactMatch) {
      setProductId(exactMatch.id);
      setShowAddNew(false);
      setCloseMatch(null);
    } else {
      const match = findClosestMatch(inputValue, products, 0.75);
      setCloseMatch(match);
      setShowAddNew(inputValue.trim() !== '' && !match);
    }
  }, [inputValue, products, brandId, setProductId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // If input doesn't match any existing product, clear the productId
    const exactMatch = products.find(
      product => product.name.toLowerCase() === e.target.value.trim().toLowerCase()
    );
    
    if (!exactMatch) {
      setProductId('');
    }
  };

  const handleSelectProduct = (selectedProduct: ProductWithName) => {
    setInputValue(selectedProduct.name);
    setProductId(selectedProduct.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewProduct = async () => {
    if (!brandId || inputValue.trim() === '') return;

    const existingProduct = products.find(
      product => product.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingProduct) {
      handleSelectProduct(existingProduct);
      return;
    }

    try {
      const normalized = normalizeName(inputValue);
      
      // Check if name already exists in DB
      const { data: existingName } = await supabase
        .from('names')
        .select('id, name')
        .ilike('name', normalized)
        .maybeSingle();

      let nameId: string;
      
      if (existingName) {
        nameId = existingName.id;
      } else {
        const { data: nameData, error: nameError } = await supabase
          .from('names')
          .insert({ name: normalized })
          .select()
          .single();
        
        if (nameError) {
          console.error('Error creating name:', nameError);
          throw nameError;
        }
        nameId = nameData.id;
      }

      // Create the product with the name_id
      const { data, error } = await supabase
        .from('products')
        .insert({ 
          brand_id: brandId,
          name_id: nameId
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting new product:', error);
        toast({
          title: "Error",
          description: "Failed to add new product. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Fetch the newly created product with its name
      const { data: newProductData, error: fetchError } = await supabase
        .from('products')
        .select(`
          id, 
          names!inner(name)
        `)
        .eq('id', data.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching new product:', fetchError);
        throw fetchError;
      }
      
      const newProduct = {
        id: newProductData.id,
        name: newProductData.names.name
      };

      toast({
        title: "Success",
        description: "New product added successfully!",
      });
      
      setProductId(newProduct.id);
      setInputValue(newProduct.name);
      setIsDropdownVisible(false);
    } catch (error) {
      console.error('Error in product creation:', error);
      toast({
        title: "Error",
        description: "Failed to add new product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={brandId ? "Enter product name..." : "Select a brand first"}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
        className="w-full"
        disabled={!brandId || isLoading}
      />
      {isDropdownVisible && (suggestions.length > 0 || showAddNew || closeMatch) && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          {closeMatch && (
            <div
              className="px-4 py-2 cursor-pointer bg-accent/30 hover:bg-accent/50 flex items-center gap-2 text-sm border-b"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectProduct(closeMatch);
              }}
            >
              <ArrowRight className="w-4 h-4 text-primary" />
              <span>Did you mean <strong>"{closeMatch.name}"</strong>?</span>
            </div>
          )}
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectProduct(suggestion);
              }}
            >
              {suggestion.name}
            </div>
          ))}
          {showAddNew && (
            <div
              className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center text-muted-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddNewProduct();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add "{inputValue.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
