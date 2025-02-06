import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BrandSelectProps {
  brand: string;
  setBrand: (brand: string) => void;
}

export const BrandSelect = ({ brand, setBrand }: BrandSelectProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(brand);
  const { toast } = useToast();

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      console.log('Fetching brands from database...');
      const { data, error } = await supabase
        .from('brands')
        .select('name')
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
      return;
    }

    const filteredBrands = brands
      .map(b => b.name)
      .filter(name => 
        name.toLowerCase().includes(inputValue.toLowerCase())
      );
    setSuggestions(filteredBrands);
  }, [inputValue, brands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectBrand = async (selectedBrand: string) => {
    setInputValue(selectedBrand);
    setBrand(selectedBrand);
    setSuggestions([]);
  };

  const handleBlur = async () => {
    if (inputValue.trim() === '') return;

    // Check if brand exists
    const existingBrand = brands.find(
      b => b.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (!existingBrand) {
      // Insert new brand
      const { error } = await supabase
        .from('brands')
        .insert({ name: inputValue.trim() });

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
    }

    setBrand(inputValue.trim());
  };

  return (
    <div className="relative">
      <Input
        placeholder="Enter brand name..."
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-full"
      />
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectBrand(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};