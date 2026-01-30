
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface NameSelectProps {
  productName: string;
  setProductName: (name: string) => void;
  onNameIdChange?: (nameId: string | null) => void;
  autoFocus?: boolean;
}

export const NameSelect = ({ productName, setProductName, onNameIdChange, autoFocus = false }: NameSelectProps) => {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { toast } = useToast();

  const { data: names = [] } = useQuery({
    queryKey: ['product_names'],
    queryFn: async () => {
      console.log('Fetching product names from database...');
      const { data, error } = await supabase
        .from('names')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching product names:', error);
        throw error;
      }
      
      console.log('Fetched product names:', data);
      return data || [];
    },
  });

  useEffect(() => {
    if (productName.trim() === '') {
      setSuggestions([]);
      setShowAddNew(false);
      if (onNameIdChange) onNameIdChange(null);
      return;
    }

    const filteredNames = names.filter(name => 
      name.name.toLowerCase().includes(productName.toLowerCase())
    );

    setSuggestions(filteredNames);
    
    const exactMatch = names.find(
      name => name.name.toLowerCase() === productName.trim().toLowerCase()
    );
    
    if (exactMatch && onNameIdChange) {
      onNameIdChange(exactMatch.id);
    } else if (onNameIdChange) {
      onNameIdChange(null);
    }
    
    setShowAddNew(!exactMatch && productName.trim() !== '');
  }, [productName, names, onNameIdChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleSelectName = (selectedName: { id: string; name: string }) => {
    setProductName(selectedName.name);
    if (onNameIdChange) onNameIdChange(selectedName.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewName = async () => {
    if (productName.trim() === '') return;

    const { data, error } = await supabase
      .from('names')
      .insert({ name: productName.trim() })
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
      {isDropdownVisible && (suggestions.length > 0 || showAddNew) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-700"
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
