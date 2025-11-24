import React from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal = ({ imageUrl, isOpen, onClose }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60" />
        <DialogContent 
          closeButton={false}
          className="max-w-7xl w-full p-0 overflow-hidden bg-transparent border-0 shadow-none"
        >
          <div className="relative w-fit mx-auto rounded-lg overflow-hidden">
            <img 
              src={imageUrl}
              alt="Product"
              className="max-h-[90vh] h-auto rounded-lg"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white hover:bg-white/90 text-foreground transition-all flex items-center justify-center shadow-lg"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};