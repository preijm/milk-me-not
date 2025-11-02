import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal = ({ imageUrl, isOpen, onClose }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full p-0 overflow-hidden bg-black/95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <X className="h-5 w-5 text-black" />
        </button>
        <div className="relative">
          <img 
            src={imageUrl}
            alt="Product"
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};