
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { ProductResultItem } from "./product-search/ProductResultItem";
import { SelectedProduct } from "./product-search/SelectedProduct";

interface ProductSearchProps {
  onSelectProduct: (productId: string, brandId: string) => void;
  onAddNew: () => void;
  selectedProductId?: string;
}

export const ProductSearch = ({ onSelectProduct, onAddNew, selectedProductId }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const isMobile = useIsMobile();

  // Fetch selected product details if available
  const { data: selectedProduct } = useQuery({
    queryKey: ['selected_product', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null;
      
      const { data, error } = await supabase
        .from('product_search_view')
        .select('*')
        .eq('id', selectedProductId)
        .single();
      
      if (error) {
        console.error('Error fetching selected product:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedProductId,
  });

  // Update search term when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.brand_name} - ${selectedProduct.product_name}`);
    }
  }, [selectedProduct]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['product_search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      console.log('Searching for products:', searchTerm);
      
      // Fix: Improve search to include flavors and ingredients
      const { data, error } = await supabase
        .from('product_search_view')
        .select('*')
        .or(`product_name.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,flavor_names.cs.{"${searchTerm}"}`)
        .limit(20);
      
      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }
      
      // Also search ingredients
      const { data: ingredientResults, error: ingredientsError } = await supabase
        .from('product_search_view')
        .select('*')
        .contains('ingredients', [searchTerm])
        .limit(20);
        
      if (ingredientsError) {
        console.error('Error searching ingredients:', ingredientsError);
      } else if (ingredientResults) {
        // Combine results, removing duplicates by id
        const combinedResults = [...data || []];
        
        ingredientResults.forEach(item => {
          if (!combinedResults.some(existing => existing.id === item.id)) {
            combinedResults.push(item);
          }
        });
        
        data = combinedResults;
      }
      
      console.log('Search results:', data);

      // Transform the results to match the format expected by the component
      return data?.map(item => ({
        id: item.id,
        name: item.product_name,
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        product_types: item.product_types,
        ingredients: item.ingredients,
        flavor_names: item.flavor_names || []
      })) || [];
    },
    enabled: searchTerm.length >= 2 && !selectedProductId,
  });

  useEffect(() => {
    setIsDropdownVisible(searchResults.length > 0);
  }, [searchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Clear selected product if user is typing new search
    if (selectedProductId) {
      onSelectProduct("", "");
    }
  };

  const handleSelectProduct = (productId: string, brandId: string) => {
    onSelectProduct(productId, brandId);
    setIsDropdownVisible(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSelectProduct("", "");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search for product..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => !selectedProductId && setIsDropdownVisible(searchResults.length > 0)}
              className="pl-9 w-full"
            />
            {searchTerm && (
              <button 
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          {!isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    onClick={onAddNew}
                    className="whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Product
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Register a new product when you can't find it in the search results. Make sure to select the correct brand first.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {isMobile && (
          <div className="mt-2">
            <Button 
              type="button" 
              onClick={onAddNew}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </div>
        )}
        
        {/* Selected product details */}
        {selectedProduct && (
          <SelectedProduct product={selectedProduct} />
        )}
        
        {isDropdownVisible && !selectedProductId && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <ProductResultItem 
                  key={result.id} 
                  result={result} 
                  searchTerm={searchTerm} 
                  onSelect={() => handleSelectProduct(result.id, result.brand_id)} 
                />
              ))
            ) : searchTerm.length >= 2 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
