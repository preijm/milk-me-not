
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X } from "lucide-react";

interface SearchIconProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

export const SearchIcon = ({ searchTerm, setSearchTerm, placeholder = "Search..." }: SearchIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleApplySearch = () => {
    setSearchTerm(localSearchTerm);
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplySearch();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg relative h-10 w-full justify-center"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          {searchTerm && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#2144ff' }} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Search</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <Input
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
