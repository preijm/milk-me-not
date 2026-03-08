
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { normalizeName, findClosestMatch } from "@/lib/nameNormalization";

export interface Brand {
  id: string;
  name: string;
}

export const useBrandData = (inputValue: string, brandId: string, setBrandId: (id: string) => void) => {
  const [suggestions, setSuggestions] = useState<Brand[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [closeMatch, setCloseMatch] = useState<Brand | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch brands from Supabase
  const { data: brands = [], isLoading } = useQuery({
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

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      setShowAddNew(false);
      setCloseMatch(null);
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
    
    if (exactMatch) {
      setBrandId(exactMatch.id);
      setShowAddNew(false);
      setCloseMatch(null);
    } else {
      // Only clear brandId if the input has changed
      if (brandId) {
        const currentBrand = brands.find(brand => brand.id === brandId);
        if (currentBrand && currentBrand.name.toLowerCase() !== inputValue.trim().toLowerCase()) {
          setBrandId('');
        }
      }
      
      // Find close match using fuzzy matching
      const match = findClosestMatch(inputValue, brands, 0.75);
      setCloseMatch(match);
      
      // Only show "Add new" when there's no close match
      setShowAddNew(inputValue.trim() !== '' && !match);
    }
  }, [inputValue, brands, brandId, setBrandId]);

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
