
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
            ? 'bg-primary text-primary-foreground border-primary'
            : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onToggle(!isBarista)}
      >
        Barista
      </Badge>
    </div>
  );
};
