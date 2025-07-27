
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ShopSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onInput?: () => void;
}

export const ShopSearchInput = ({ value, onChange, onFocus, onInput }: ShopSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search for shop..."
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onInput={onInput}
        className="text-left placeholder:text-left"
        autoComplete="off"
      />
    </div>
  );
};
