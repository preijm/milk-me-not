
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddIngredientFormProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export const AddIngredientForm = ({ value, onChange, onAdd, onClose }: AddIngredientFormProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add new ingredient"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd();
          } else if (e.key === 'Escape') {
            onClose();
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        disabled={!value}
        className="bg-cream-300 hover:bg-cream-200 text-gray-800"
      >
        Add
      </Button>
    </div>
  );
};
