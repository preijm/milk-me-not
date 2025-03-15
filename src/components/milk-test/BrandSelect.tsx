
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface BrandSelectProps {
  brandId: string;
  setBrandId: (id: string) => void;
  defaultBrand?: string;
}

export const BrandSelect = ({ brandId, setBrandId, defaultBrand }: BrandSelectProps) => {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [inputValue, setInputValue] = useState(defaultBrand || "");
  const [showAddNew, setShowAddNew] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { toast } = useToast();

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      console.log('Fetching brands from database...');
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
      
      console.log('Fetched brands:', data);
      return data || [];
    },
  });

  // Update the input value when brands or brandId changes
  useEffect(() => {
    if (brandId) {
      console.log("BrandSelect: brandId changed to", brandId);
      const selectedBrand = brands.find(brand => brand.id === brandId);
      if (selectedBrand) {
        setInputValue(selectedBrand.name);
        console.log("BrandSelect: Setting input value to", selectedBrand.name);
      }
    }
  }, [brandId, brands]);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      setShowAddNew(false);
      return;
    }

    const filteredBrands = brands.filter(brand => 
      brand.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    setSuggestions(filteredBrands);
    
    // Check for exact match (case-insensitive)
    const exactMatch = brands.find(
      brand => brand.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    
    // If there's an exact match, select it automatically and don't show "Add new"
    if (exactMatch) {
      setBrandId(exactMatch.id);
      setShowAddNew(false);
    } else {
      // Only clear brandId if the input has changed
      if (brandId) {
        const currentBrand = brands.find(brand => brand.id === brandId);
        if (currentBrand && currentBrand.name.toLowerCase() !== inputValue.trim().toLowerCase()) {
          setBrandId('');
        }
      }
      setShowAddNew(inputValue.trim() !== '');
    }
  }, [inputValue, brands, setBrandId, brandId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("BrandSelect: Input changed to", newValue);
    setInputValue(newValue);
    
    // If the input matches any existing brand, update the brandId
    const exactMatch = brands.find(
      brand => brand.name.toLowerCase() === newValue.trim().toLowerCase()
    );
    
    if (exactMatch) {
      console.log("BrandSelect: Exact match found, setting brandId to", exactMatch.id);
      setBrandId(exactMatch.id);
    } else if (newValue.trim() === '') {
      console.log("BrandSelect: Input is empty, clearing brandId");
      setBrandId('');
    }
  };

  const handleSelectBrand = (selectedBrand: { id: string; name: string }) => {
    console.log("BrandSelect: Selected brand", selectedBrand);
    setInputValue(selectedBrand.name);
    setBrandId(selectedBrand.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewBrand = async () => {
    if (inputValue.trim() === '') return;

    // First, check if the brand already exists (case-insensitive)
    const existingBrand = brands.find(
      brand => brand.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingBrand) {
      console.log('Brand already exists, selecting it:', existingBrand);
      handleSelectBrand(existingBrand);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .insert({ name: inputValue.trim() })
        .select()
        .single();

      if (error) {
        console.error('Error inserting new brand:', error);
        toast({
          title: "Error",
          description: "Failed to add new brand. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "New brand added successfully!",
      });
      
      console.log("BrandSelect: New brand created, setting brandId to", data.id);
      setBrandId(data.id);
      setIsDropdownVisible(false);
    } catch (error) {
      console.error('Error creating brand:', error);
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder="Enter brand name..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
        className="w-full pr-10"
        disabled={isLoading}
      />
      {isDropdownVisible && (suggestions.length > 0 || showAddNew) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectBrand(suggestion);
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
                handleAddNewBrand();
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
