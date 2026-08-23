
import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRight } from "lucide-react";
import { normalizeName, findClosestMatch } from "@/lib/nameNormalization";
import { SUGGESTION_PANEL, SUGGESTION_ROW, SUGGESTION_ROW_HINT, SUGGESTION_ROW_MUTED } from "./suggestionStyles";

interface NameSelectProps {
  productName: string;
  setProductName: (name: string) => void;
  onNameIdChange?: (nameId: string | null) => void;
  autoFocus?: boolean;
}

// Stable reference for the loading/error case — see NO_COUNTRIES in
// CountrySelect for why a `[]` literal default loops here.
const NO_NAMES: Array<{ id: string; name: string }> = [];

export const NameSelect = ({ productName, setProductName, onNameIdChange, autoFocus = false }: NameSelectProps) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { toast } = useToast();

  const { data: names = NO_NAMES } = useQuery({
    queryKey: ['product_names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('names')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching product names:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // What the typed name matches is a pure function of the text and the fetched
  // list, so it is computed rather than held in three pieces of state written by
  // an effect. Every keystroke used to render once against the previous word's
  // matches before the effect caught up.
  const { suggestions, showAddNew, closeMatch, matchedNameId } = useMemo(() => {
    if (productName.trim() === '') {
      return {
        suggestions: NO_NAMES,
        showAddNew: false,
        closeMatch: null,
        matchedNameId: null,
      };
    }

    const filteredNames = names.filter(name =>
      name.name.toLowerCase().includes(productName.toLowerCase())
    );

    const exactMatch = names.find(
      name => name.name.toLowerCase() === productName.trim().toLowerCase()
    );

    if (exactMatch) {
      return {
        suggestions: filteredNames,
        showAddNew: false,
        closeMatch: null,
        matchedNameId: exactMatch.id,
      };
    }

    // Find close match using fuzzy matching
    const match = findClosestMatch(productName, names, 0.75);
    return {
      suggestions: filteredNames,
      showAddNew: !match,
      closeMatch: match,
      matchedNameId: null,
    };
  }, [productName, names]);

  // Telling the parent is a real side effect, so it stays in an effect — but it
  // now fires when the matched id actually changes, rather than on every
  // keystroke that leaves it null.
  useEffect(() => {
    onNameIdChange?.(matchedNameId);
  }, [matchedNameId, onNameIdChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleSelectName = (selectedName: { id: string; name: string }) => {
    setProductName(selectedName.name);
    if (onNameIdChange) onNameIdChange(selectedName.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewName = async () => {
    const normalized = normalizeName(productName);
    if (normalized === '') return;

    // Check DB directly with ilike to avoid stale cache duplicates
    const { data: existingInDb } = await supabase
      .from('names')
      .select('id, name')
      .ilike('name', normalized)
      .maybeSingle();

    if (existingInDb) {
      setProductName(existingInDb.name);
      if (onNameIdChange) onNameIdChange(existingInDb.id);
      setIsDropdownVisible(false);
      toast({
        title: "Name found",
        description: `Using existing name "${existingInDb.name}".`,
      });
      return;
    }

    const { data, error } = await supabase
      .from('names')
      .insert({ name: normalized })
      .select()
      .single();

    if (error) {
      console.error('Error inserting new product name:', error);
      toast({
        title: "Error",
        description: "Failed to add new product name. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "New product name added successfully!",
    });
    
    if (onNameIdChange) onNameIdChange(data.id);
    setIsDropdownVisible(false);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Enter product name..."
        value={productName}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
        className="w-full pr-10"
        autoFocus={autoFocus}
      />
      {isDropdownVisible && (suggestions.length > 0 || showAddNew || closeMatch) && (
        <div className={SUGGESTION_PANEL}>
          {closeMatch && (
            <div
              className={SUGGESTION_ROW_HINT}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectName(closeMatch);
              }}
            >
              <ArrowRight className="h-4 w-4 shrink-0" />
              <span>Did you mean <strong>"{closeMatch.name}"</strong>?</span>
            </div>
          )}
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={SUGGESTION_ROW}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectName(suggestion);
              }}
            >
              {suggestion.name}
            </div>
          ))}
          {showAddNew && (
            <div
              className={SUGGESTION_ROW_MUTED}
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddNewName();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add "{productName.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
