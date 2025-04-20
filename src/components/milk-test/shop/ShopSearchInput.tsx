
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ShopSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ShopSearchInput = ({ value, onChange }: ShopSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search for shop..."
        value={value}
        onChange={onChange}
        className="pl-9 w-full focus-visible:ring-primary/70"
        autoComplete="off"
      />
    </div>
  );
};
