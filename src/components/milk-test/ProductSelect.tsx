
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

interface ProductSelectProps {
  brandId: string;
  productId: string;
  setProductId: (id: string) => void;
}

export const ProductSelect = ({ brandId, productId, setProductId }: ProductSelectProps) => {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ['products', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      console.log('Fetching products for brand:', brandId);
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('brand_id', brandId)
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Fetched products:', data);
      return data || [];
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
    } else {
      setInputValue("");
    }
  }, [productId, products]);

  useEffect(() => {
    if (!brandId || inputValue.trim() === '') {
      setSuggestions([]);
      setShowAddNew(false);
      return;
    }

    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    setSuggestions(filteredProducts);
    
    const exactMatch = products.some(
      product => product.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    setShowAddNew(!exactMatch && inputValue.trim() !== '');
  }, [inputValue, products, brandId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!e.target.value) {
      setProductId("");
    }
  };

  const handleSelectProduct = (selectedProduct: { id: string; name: string }) => {
    setInputValue(selectedProduct.name);
    setProductId(selectedProduct.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewProduct = async () => {
    if (!brandId || inputValue.trim() === '') return;

    const { data, error } = await supabase
      .from('products')
      .insert({ 
        name: inputValue.trim(),
        brand_id: brandId
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

    toast({
      title: "Success",
      description: "New product added successfully!",
    });
    
    setProductId(data.id);
    setIsDropdownVisible(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder={brandId ? "Enter product name..." : "Select a brand first"}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setIsDropdownVisible(false)}
        className="w-full"
        disabled={!brandId}
      />
      {isDropdownVisible && (suggestions.length > 0 || showAddNew) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-700"
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
