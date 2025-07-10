import React from "react";
import { useEditMilkTest } from "@/hooks/useEditMilkTest";
import { EditMilkTestForm } from "./edit/EditMilkTestForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MilkTestResult } from "@/types/milk-test";
interface EditMilkTestProps {
  test: MilkTestResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
export const EditMilkTest = ({
  test,
  open,
  onOpenChange,
  onSuccess
}: EditMilkTestProps) => {
  // Use our custom hook to manage the form state and submission
  const {
    formState,
    formSetters,
    handleSubmit,
    handleDelete
  } = useEditMilkTest({
    test,
    onSuccess,
    onClose: () => onOpenChange(false)
  });
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
        <DialogHeader className="bg-white/50 backdrop-blur-sm -m-6 px-6 py-4 mb-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-gray-900">Update That Moo Record</DialogTitle>
        </DialogHeader>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 animate-fade-in p-6">
          <EditMilkTestForm formState={formState} formSetters={formSetters} brand={test.brand || test.brand_name || ""} productName={test.product_name} onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} onDelete={handleDelete} />
        </div>
      </DialogContent>
    </Dialog>;
};