
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShopSelectProps {
  shop: string | null;
  setShop: (shop: string) => void;
}

export const ShopSelect = ({ shop, setShop }: ShopSelectProps) => {
  const [suggestions, setSuggestions] = useState<{ name: string; country_code: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const { toast } = useToast();

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

    const filteredShops = shops.filter(s => 
      s.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    setSuggestions(filteredShops);
  }, [inputValue, shops]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectShop = (selectedShop: { name: string; country_code: string }) => {
    setInputValue(selectedShop.name);
    setShop(selectedShop.name);
    setSuggestions([]); // Clear suggestions immediately after selection
  };

  const handleAddNewShop = async () => {
    if (!newShopName.trim() || !selectedCountryCode) {
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
          country_code: selectedCountryCode,
        });

      if (error) throw error;

      toast({
        title: "Shop added",
        description: "New shop has been added successfully",
      });

      setNewShopName("");
      setSelectedCountryCode("");
      setIsAddingShop(false);
      refetchShops();
      
      setInputValue(newShopName.trim());
      setShop(newShopName.trim());
      setSuggestions([]); // Clear suggestions after adding new shop
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
      setInputValue(shop);
    }
  }, [shop]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Enter shop name..."
            value={inputValue}
            onChange={handleInputChange}
            className="w-full"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.name}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectShop(suggestion)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {suggestion.name} ({suggestion.country_code})
                </div>
              ))}
            </div>
          )}
        </div>
        <Dialog open={isAddingShop} onOpenChange={setIsAddingShop}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shop</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Shop name"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={selectedCountryCode}
                  onValueChange={setSelectedCountryCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddNewShop} className="w-full">
                Add Shop
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
