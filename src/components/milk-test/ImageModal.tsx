import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal = ({ imageUrl, isOpen, onClose }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full p-0 overflow-hidden bg-transparent border-0 [&>button]:w-9 [&>button]:h-9 [&>button]:rounded-full [&>button]:bg-black/60 [&>button]:hover:bg-black/80 [&>button]:text-white [&>button]:transition-all [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:absolute [&>button]:top-4 [&>button]:right-4 [&>button]:z-50">
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={imageUrl}
            alt="Product"
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};