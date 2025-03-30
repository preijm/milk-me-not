
import React from "react";
import { Input } from "@/components/ui/input";

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
  return (
    <div className={className}>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};
