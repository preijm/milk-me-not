
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

interface BarcodeResultDialogProps {
  open: boolean;
  onClose: () => void;
  brandName: string;
  productName: string;
  productUrl?: string;
  onConfirm: (brandName: string, productName: string) => void;
  isLoading?: boolean;
}

export const BarcodeResultDialog = ({ 
  open, 
  onClose, 
  brandName,
  productName,
  productUrl,
  onConfirm,
  isLoading = false
}: BarcodeResultDialogProps) => {
  const [editedBrandName, setEditedBrandName] = useState(brandName);
  const [editedProductName, setEditedProductName] = useState(productName);

  // Update state when props change
  React.useEffect(() => {
    setEditedBrandName(brandName);
    setEditedProductName(productName);
  }, [brandName, productName]);

  const handleConfirm = () => {
    onConfirm(editedBrandName, editedProductName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Information</DialogTitle>
          {isLoading && (
            <DialogDescription>Loading product details...</DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand-name" className="text-right">
              Brand
            </Label>
            <Input
              id="brand-name"
              value={editedBrandName}
              onChange={(e) => setEditedBrandName(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-name" className="text-right">
              Product
            </Label>
            <Input
              id="product-name"
              value={editedProductName}
              onChange={(e) => setEditedProductName(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          {productUrl && (
            <div className="flex justify-end">
              <a 
                href={productUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                View on Open Food Facts <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
