
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
      {/* z-10 because the input's own background is opaque and paints after
          this in tree order — the magnifier was rendered but invisible. */}
      <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-story-muted-2" />
      <Input
        placeholder="Search or add shop..."
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="pl-11 pr-4"
        autoComplete="off"
      />
    </div>
  );
};
