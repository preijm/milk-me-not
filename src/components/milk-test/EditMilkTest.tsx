
import React from "react";
import { useEditMilkTest } from "@/hooks/useEditMilkTest";
import { EditMilkTestForm } from "./edit/EditMilkTestForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EditMilkTestProps {
  test: {
    id: string;
    brand: string;
    brand_id: string;
    product_name?: string;
    product_id: string;
    shop?: string;
    shop_name?: string;
    is_barista?: boolean;
    rating: number;
    notes?: string;
    product_type_keys?: string[];
    picture_path?: string;
    price_quality_ratio?: string;
    drink_preference?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditMilkTest = ({ test, open, onOpenChange, onSuccess }: EditMilkTestProps) => {
  // Use our custom hook to manage the form state and submission
  const { formState, formSetters, handleSubmit } = useEditMilkTest({
    test,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Milk Test</DialogTitle>
          <DialogDescription>
            Make changes to your milk test record
          </DialogDescription>
        </DialogHeader>
        
        <EditMilkTestForm
          formState={formState}
          formSetters={formSetters}
          brand={test.brand}
          productName={test.product_name}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
