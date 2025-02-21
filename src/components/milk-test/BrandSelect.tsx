
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  const { data: brands = [] } = useQuery({
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
    
    const exactMatch = brands.some(
      brand => brand.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    setShowAddNew(!exactMatch && inputValue.trim() !== '');
  }, [inputValue, brands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectBrand = (selectedBrand: { id: string; name: string }) => {
    setInputValue(selectedBrand.name);
    setBrandId(selectedBrand.id);
    setSuggestions([]); 
    setShowAddNew(false);
  };

  const handleAddNewBrand = async () => {
    if (inputValue.trim() === '') return;

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
    
    setBrandId(data.id);
    setSuggestions([]);
    setShowAddNew(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Enter brand name..."
        value={inputValue}
        onChange={handleInputChange}
        onBlur={() => {
          // Use setTimeout to allow click events to fire first
          setTimeout(() => {
            setSuggestions([]);
            setShowAddNew(false);
          }, 200);
        }}
        className="w-full"
      />
      {(suggestions.length > 0 || showAddNew) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectBrand(suggestion)}
            >
              {suggestion.name}
            </div>
          ))}
          {showAddNew && (
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-700"
              onClick={handleAddNewBrand}
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
