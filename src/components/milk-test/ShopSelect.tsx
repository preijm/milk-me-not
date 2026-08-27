
import React, { useState, useMemo } from "react";
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

// Stable reference for the loading/error case — see NO_COUNTRIES in
// CountrySelect. `shops` is an effect dependency that setStates, so a fresh
// `[]` literal each render spins the component until the query resolves.
const NO_SHOPS: { name: string; country_code: string }[] = [];

export const ShopSelect = ({ shop, setShop, selectedCountry }: ShopSelectProps) => {
  const [inputValue, setInputValue] = useState(shop ?? "");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: shops = NO_SHOPS, refetch: refetchShops } = useQuery({
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

  // Follow the prop when it changes from outside — picking a shop elsewhere, or
  // the form resetting. Typing clears `shop` (see handleInputChange), so this
  // never fights the user mid-word. Compared during render rather than in an
  // effect so the input never paints one frame of the stale name.
  const [seenShop, setSeenShop] = useState(shop);
  if (shop !== seenShop) {
    setSeenShop(shop);
    if (shop) setInputValue(shop);
  }

  // Suggestions and the "add new" affordance are a pure function of what has
  // been typed and what the query returned, so they are computed rather than
  // stored. They used to live in state, written by an effect, which meant every
  // keystroke rendered once with the previous word's matches.
  const { suggestions, showAddNew } = useMemo(() => {
    if (inputValue.trim() === '') {
      return { suggestions: NO_SHOPS, showAddNew: false };
    }

    const searchTerm = inputValue.toLowerCase();
    return {
      suggestions: shops.filter(s => s.name.toLowerCase().includes(searchTerm)),
      showAddNew: !shops.some(s => s.name.toLowerCase() === searchTerm),
    };
  }, [inputValue, shops]);

  /**
   * Typing is choosing.
   *
   * This used to clear `shop` on every keystroke and only set it again if the
   * reader picked a suggestion or pressed "add". Shop is optional, so nothing
   * stopped them submitting — the name sat in the box looking entered, and the
   * rating saved with no shop at all. Worse for an edit: picking a shop and
   * then touching the field cleared it while still displaying the old name.
   *
   * `milk_tests.shop_name` is free text, not a foreign key — the `shops` table
   * is a suggestion list. So there is nothing to protect by discarding this,
   * and the suggestions still do their real job of steering three spellings of
   * one shop back together.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;
    setInputValue(typed);
    setShop(typed.trim() === "" ? "" : typed);
  };

  /**
   * Settle on the board's spelling where there is one.
   *
   * "albert heijn" and "Albert Heijn" are the same shop, and the second is
   * what every other rating says. Matching case-insensitively on the way out
   * keeps them together without making the reader notice.
   */
  const commitTypedShop = () => {
    const typed = inputValue.trim();
    if (!typed) {
      if (shop) setShop("");
      return;
    }

    const known = shops.find((s) => s.name.toLowerCase() === typed.toLowerCase());
    const settled = known ? known.name : typed;
    setInputValue(settled);
    setShop(settled);
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
        onBlur={() => {
          if (!isEditing) {
            commitTypedShop();
            setTimeout(() => setIsDropdownVisible(false), 200);
          }
        }}
      />
      <ShopSuggestions
        suggestions={suggestions}
        showAddNew={showAddNew}
        inputValue={inputValue}
        onSelect={handleSelectShop}
        onAddNew={handleAddNewShop}
        isVisible={isDropdownVisible}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};
