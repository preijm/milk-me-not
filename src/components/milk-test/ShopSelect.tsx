
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ShopSuggestions } from "./shop/ShopSuggestions";
import { ShopSearchInput } from "./shop/ShopSearchInput";

interface ShopSelectProps {
  shop: string | null;
  setShop: (shop: string) => void;
  selectedCountry?: string;
}

export const ShopSelect = ({ shop, setShop, selectedCountry }: ShopSelectProps) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; country_code: string }[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const { toast } = useToast();

  const { data: shops = [], refetch: refetchShops } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      console.log('Fetching all shops');
      const { data, error } = await supabase
        .from('shops')
        .select('name, country_code')
        .order('name');
      
      if (error) {
        console.error('Error fetching shops:', error);
        throw error;
      }
      
      console.log('Fetched shops:', data);
      return data || [];
    },
  });

  // Initialize input value from prop
  useEffect(() => {
    if (shop) {
      setInputValue(shop);
    }
  }, [shop]);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      setShowAddNew(false);
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const filteredShops = shops.filter(s => 
      s.name.toLowerCase().includes(searchTerm)
    );

    setSuggestions(filteredShops);
    
    // Show "Add new" option if there's no exact match
    const exactMatch = shops.some(s => 
      s.name.toLowerCase() === searchTerm
    );
    setShowAddNew(!exactMatch && inputValue.trim().length > 0);
  }, [inputValue, shops]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear the selected shop when typing
    if (shop) {
      setShop("");
    }
  };

  const handleSelectShop = (selectedShop: { name: string; country_code: string }) => {
    setInputValue(selectedShop.name);
    setShop(selectedShop.name);
    setIsDropdownVisible(false);
  };

  const handleAddNewShop = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide shop name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shops')
        .insert({
          name: inputValue.trim(),
          country_code: selectedCountry || null,
        });

      if (error) throw error;

      toast({
        title: "Shop added",
        description: "New shop has been added successfully",
      });

      setShop(inputValue.trim());
      setIsDropdownVisible(false);
      refetchShops();
    } catch (error) {
      console.error('Error adding shop:', error);
      toast({
        title: "Error",
        description: "Failed to add new shop. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <ShopSearchInput
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
      />
      <ShopSuggestions
        suggestions={suggestions}
        showAddNew={showAddNew}
        inputValue={inputValue}
        onSelect={handleSelectShop}
        onAddNew={handleAddNewShop}
        isVisible={isDropdownVisible}
      />
    </div>
  );
};
