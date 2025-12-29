
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CountrySelectProps {
  country: string | null;
  setCountry: (country: string) => void;
}

export const CountrySelect = ({ country, setCountry }: CountrySelectProps) => {
  const [suggestions, setSuggestions] = useState<{ code: string; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      console.log('Fetching countries from database...');
      const { data, error } = await supabase
        .from('countries')
        .select('name, code')
        .order('name');
      
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      
      console.log('Fetched countries:', data);
      return data || [];
    },
  });

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filteredCountries = countries.filter(c => 
      c.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      c.code.toLowerCase().includes(inputValue.toLowerCase())
    );

    setSuggestions(filteredCountries);
  }, [inputValue, countries]);

  const getCountryFlag = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsUserTyping(true);
  };

  const handleSelectCountry = (selectedCountry: { code: string; name: string }) => {
    setInputValue(selectedCountry.name);
    setCountry(selectedCountry.code);
    setSuggestions([]);
    setIsUserTyping(false);
  };

  // Find the selected country to display its name in the input
  useEffect(() => {
    if (country && countries.length > 0) {
      const selectedCountry = countries.find(c => c.code === country);
      if (selectedCountry && !isUserTyping) {
        setInputValue(selectedCountry.name);
      }
    }
  }, [country, countries, isUserTyping]);

  return (
    <div className="relative">
      <Input
        placeholder="Enter country name..."
        value={inputValue}
        onChange={handleInputChange}
        className="w-full"
      />
      {suggestions.length > 0 && isUserTyping && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.code}
              className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center gap-2 text-foreground"
              onClick={() => handleSelectCountry(suggestion)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className="text-lg">{getCountryFlag(suggestion.code)}</span>
              <span>{suggestion.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
