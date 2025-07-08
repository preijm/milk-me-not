
import React from "react";
import { Badge } from "@/components/ui/badge";

interface BaristaToggleProps {
  isBarista: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export const BaristaToggle = ({ isBarista, onToggle, disabled = false }: BaristaToggleProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="barista"
        className={`cursor-pointer transition-all ${
          isBarista
            ? 'bg-amber-600 text-white border-amber-600'
            : 'hover:bg-amber-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onToggle(!isBarista)}
      >
        Barista
      </Badge>
    </div>
  );
};
