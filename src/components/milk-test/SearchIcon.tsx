
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, CornerDownLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchIconProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

export const SearchIcon = ({ searchTerm, setSearchTerm, placeholder = "Search..." }: SearchIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const isMobile = useIsMobile();

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchTerm(localSearchTerm);
      setIsOpen(false);
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
      <PopoverContent 
        className={`${isMobile ? 'w-48' : 'w-48'} p-4`} 
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Search</h3>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Input
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
                autoFocus
                className="pr-10"
              />
              <button
                onClick={() => {
                  setSearchTerm(localSearchTerm);
                  setIsOpen(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                type="button"
              >
                <CornerDownLeft className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
