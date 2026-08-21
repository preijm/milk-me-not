
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { SUGGESTION_PANEL, SUGGESTION_ROW, SUGGESTION_SCROLL } from "./suggestionStyles";

interface CountrySelectProps {
  country: string | null;
  setCountry: (country: string) => void;
}

// Shared empty array so the effects below keep a stable `countries` reference
// while the query is loading. A `= []` default literal is a new array on every
// render, which re-fires effects that setState, which renders again — an
// infinite loop for as long as the fetch is in flight, and forever if it fails.
const NO_COUNTRIES: { code: string; name: string }[] = [];

export const CountrySelect = ({ country, setCountry }: CountrySelectProps) => {
  const [suggestions, setSuggestions] = useState<{ code: string; name: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);

  const { data: countries = NO_COUNTRIES } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('name, code')
        .order('name');

      if (error) throw error;
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
        <div className={cn(SUGGESTION_PANEL, SUGGESTION_SCROLL)}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.code}
              className={SUGGESTION_ROW}
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
