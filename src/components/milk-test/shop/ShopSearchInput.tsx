
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ShopSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const ShopSearchInput = ({ 
  value, 
  onChange, 
  onFocus,
  onBlur 
}: ShopSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search or add shop..."
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="pl-10 w-full"
        autoComplete="off"
      />
    </div>
  );
};
