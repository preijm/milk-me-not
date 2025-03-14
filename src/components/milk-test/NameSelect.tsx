
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

interface NameSelectProps {
  productName: string;
  setProductName: (name: string) => void;
}

export const NameSelect = ({ productName, setProductName }: NameSelectProps) => {
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
      return;
    }

    const filteredNames = names.filter(name => 
      name.name.toLowerCase().includes(productName.toLowerCase())
    );

    setSuggestions(filteredNames);
    
    const exactMatch = names.some(
      name => name.name.toLowerCase() === productName.trim().toLowerCase()
    );
    setShowAddNew(!exactMatch && productName.trim() !== '');
  }, [productName, names]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleSelectName = (selectedName: { id: string; name: string }) => {
    setProductName(selectedName.name);
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
