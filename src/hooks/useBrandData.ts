
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { normalizeName, findClosestMatch } from "@/lib/nameNormalization";

export interface Brand {
  id: string;
  name: string;
}

// Stable reference for the loading/error case — see NO_COUNTRIES in
// CountrySelect for why a `[]` literal default loops here.
const NO_BRANDS: Brand[] = [];

export const useBrandData = (inputValue: string, brandId: string, setBrandId: (id: string) => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch brands from Supabase
  const { data: brands = NO_BRANDS, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // What the typed text matches is a pure function of the text and the fetched
  // list, so it is computed rather than kept in three pieces of state written by
  // an effect. Every keystroke used to render once against the previous word's
  // matches before the effect caught up.
  const { suggestions, showAddNew, closeMatch, exactMatchId } = useMemo(() => {
    if (inputValue.trim() === '') {
      return {
        suggestions: NO_BRANDS,
        showAddNew: false,
        closeMatch: null,
        exactMatchId: null,
      };
    }

    const filteredBrands = brands.filter(brand =>
      brand.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Check for exact match (case-insensitive)
    const exactMatch = brands.find(
      brand => brand.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (exactMatch) {
      return {
        suggestions: filteredBrands,
        showAddNew: false,
        closeMatch: null,
        exactMatchId: exactMatch.id,
      };
    }

    // Find close match using fuzzy matching
    const match = findClosestMatch(inputValue, brands, 0.75);
    return {
      suggestions: filteredBrands,
      // Only show "Add new" when there's no close match
      showAddNew: !match,
      closeMatch: match,
      exactMatchId: null,
    };
  }, [inputValue, brands]);

  // Reporting the resolved brand up to the form is a real side effect, so it
  // stays in an effect. An empty box is left alone, exactly as before — the old
  // code returned early rather than clearing the selection.
  useEffect(() => {
    if (inputValue.trim() === '') return;

    if (exactMatchId) {
      setBrandId(exactMatchId);
      return;
    }

    // Only clear brandId if the input has changed
    if (brandId) {
      const currentBrand = brands.find(brand => brand.id === brandId);
      if (currentBrand && currentBrand.name.toLowerCase() !== inputValue.trim().toLowerCase()) {
        setBrandId('');
      }
    }
  }, [exactMatchId, inputValue, brands, brandId, setBrandId]);

  // Add new brand to database
  const addNewBrand = async (brandName: string) => {
    const normalized = normalizeName(brandName);
    if (normalized === '') return null;

    // Check the database directly with ilike to prevent stale-cache duplicates
    const { data: existingInDb } = await supabase
      .from('brands')
      .select('id, name')
      .ilike('name', normalized)
      .maybeSingle();

    if (existingInDb) {
      console.log('Brand already exists in DB, selecting it:', existingInDb);
      toast({
        title: "Brand found",
        description: `Using existing brand "${existingInDb.name}".`,
      });
      return existingInDb;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .insert({ name: normalized })
        .select()
        .single();

      if (error) {
        console.error('Error inserting new brand:', error);
        toast({
          title: "Error",
          description: "Failed to add new brand. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Invalidate the brands cache so it picks up the new entry
      queryClient.invalidateQueries({ queryKey: ['brands'] });

      toast({
        title: "Success",
        description: "New brand added successfully!",
      });
      
      console.log("New brand created:", data);
      return data;
    } catch (error) {
      console.error('Error creating brand:', error);
      return null;
    }
  };

  return {
    brands,
    suggestions,
    showAddNew,
    closeMatch,
    isLoading,
    addNewBrand
  };
};
