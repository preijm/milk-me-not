
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
import { MilkTestResult } from "@/types/milk-test";

interface EditMilkTestProps {
  test: MilkTestResult;
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
          brand={test.brand || test.brand_name || ""}
          productName={test.product_name}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
