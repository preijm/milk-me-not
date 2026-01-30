
import React from "react";
import { Input } from "@/components/ui/input";
import { sanitizeInput } from "@/lib/security";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  className,
  placeholder = "Search by brand or product..." 
}: SearchBarProps) => {
  const handleSearchChange = (value: string) => {
    // Use centralized sanitization helper to avoid incomplete multi-character sanitization
    const sanitized = sanitizeInput(value);

    // Basic length guard only
    if (sanitized.length <= 100) {
      setSearchTerm(sanitized);
    }
  };

  return (
    <div className={className}>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-sm"
        maxLength={100} // Prevent overly long inputs
      />
    </div>
  );
};
