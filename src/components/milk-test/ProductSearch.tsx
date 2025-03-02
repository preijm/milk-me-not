
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductSearchProps {
  onSelectProduct: (productId: string, brandId: string) => void;
  onAddNew: () => void;
}

export const ProductSearch = ({ onSelectProduct, onAddNew }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const isMobile = useIsMobile();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['product_search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      console.log('Searching for products:', searchTerm);
      
      // Search products by name or brand name - using proper parameter binding
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, 
          name,
          brand_id,
          product_types,
          ingredients,
          brands:brand_id (
            id,
            name
          ),
          product_flavors (
            flavors:flavor_id (
              id,
              name
            )
          )
        `)
        .or(`name.ilike.%${searchTerm}%,brands.name.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }
      
      console.log('Search results:', data);
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  useEffect(() => {
    setIsDropdownVisible(searchResults.length > 0);
  }, [searchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectProduct = (productId: string, brandId: string) => {
    onSelectProduct(productId, brandId);
    setSearchTerm("");
    setIsDropdownVisible(false);
  };

  // Function to format additional info like flavors or product types
  const formatAdditionalInfo = (product: any) => {
    const parts = [];
    
    // Add product types if available
    if (product.product_types && product.product_types.length > 0) {
      parts.push(product.product_types.join(', '));
    }
    
    // Add flavors if available
    const flavors = product.product_flavors
      ?.map((pf: any) => pf.flavors?.name)
      .filter(Boolean);
      
    if (flavors && flavors.length > 0) {
      parts.push(flavors.join(', '));
    }
    
    return parts.length > 0 ? `(${parts.join(' • ')})` : '';
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search for a product or brand..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownVisible(searchResults.length > 0)}
              className="pl-9 w-full"
            />
          </div>
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
        </div>
        
        {isDropdownVisible && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                  onClick={() => handleSelectProduct(result.id, result.brand_id)}
                >
                  <div className="font-medium">{result.brands.name} - {result.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatAdditionalInfo(result)}
                  </div>
                </div>
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
