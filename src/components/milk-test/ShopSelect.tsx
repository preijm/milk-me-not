
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShopSuggestions } from "./shop/ShopSuggestions";
import { AddShopForm } from "./shop/AddShopForm";
import { ShopSearchInput } from "./shop/ShopSearchInput";

interface ShopSelectProps {
  shop: string | null;
  setShop: (shop: string) => void;
  selectedCountry?: string;
}

export const ShopSelect = ({ shop, setShop, selectedCountry }: ShopSelectProps) => {
  const [suggestions, setSuggestions] = useState<{ name: string; country_code: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [newShopName, setNewShopName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('code, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

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

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    // Filter shops using case-insensitive matching and country filter
    const searchTerm = inputValue.toLowerCase();
    const filteredShops = shops.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchTerm);
      const matchesCountry = !selectedCountry || shop.country_code === selectedCountry;
      return matchesSearch && matchesCountry;
    });

    console.log('Search term:', searchTerm);
    console.log('Selected country:', selectedCountry);
    console.log('Filtered shops:', filteredShops);
    
    setSuggestions(filteredShops);
  }, [inputValue, shops, selectedCountry]);

  const handleSelectShop = (selectedShop: { name: string; country_code: string }) => {
    const displayValue = `${selectedShop.name} (${selectedShop.country_code})`;
    setInputValue(displayValue);
    setShop(selectedShop.name);
    setSuggestions([]);
  };

  const handleAddNewShop = async () => {
    const countryToUse = selectedCountryCode || selectedCountry;
    if (!newShopName.trim() || !countryToUse) {
      toast({
        title: "Missing information",
        description: "Please provide both shop name and country",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shops')
        .insert({
          name: newShopName.trim(),
          country_code: countryToUse,
        });

      if (error) throw error;

      toast({
        title: "Shop added",
        description: "New shop has been added successfully",
      });

      setNewShopName("");
      setSelectedCountryCode("");
      
      const displayValue = `${newShopName.trim()} (${countryToUse})`;
      setInputValue(displayValue);
      setShop(newShopName.trim());
      setSuggestions([]);
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

  useEffect(() => {
    if (shop) {
      const selectedShop = shops.find(s => s.name === shop);
      if (selectedShop) {
        setInputValue(`${selectedShop.name} (${selectedShop.country_code})`);
      } else {
        setInputValue(shop);
      }
    }
  }, [shop, shops]);

  return (
    <div className="space-y-4">
      <div className={`${isMobile ? 'space-y-2' : 'flex gap-2'}`}>
        <div className="relative flex-1">
          <ShopSearchInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <ShopSuggestions
            suggestions={suggestions}
            onSelect={handleSelectShop}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="brand"
              className={`whitespace-nowrap ${isMobile ? 'w-full' : ''}`}
              size="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Shop
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 w-[90vw] sm:w-64 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl" 
            align={isMobile ? "center" : "end"}
            side="bottom"
            sideOffset={8}
          >
            <div className="p-4">
              <AddShopForm
                newShopName={newShopName}
                setNewShopName={setNewShopName}
                selectedCountryCode={selectedCountryCode}
                setSelectedCountryCode={setSelectedCountryCode}
                onAdd={handleAddNewShop}
                countries={countries}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
