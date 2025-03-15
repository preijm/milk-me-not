
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DuplicateProductAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseExisting: () => void;
  onModify: () => void;
}

export const DuplicateProductAlert = ({
  open,
  onOpenChange,
  onUseExisting,
  onModify,
}: DuplicateProductAlertProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Product Already Exists</AlertDialogTitle>
          <AlertDialogDescription>
            A product with these exact properties already exists in the database. 
            Would you like to use the existing product or modify your inputs to create a unique product?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            onModify();
            onOpenChange(false);
          }}>
            Modify Inputs
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            onUseExisting();
            onOpenChange(false); // Close the dialog immediately
          }}>
            Use Existing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
