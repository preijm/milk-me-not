
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { X } from "lucide-react";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageModal = ({ imageUrl, isOpen, onClose }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none" 
        closeButton={false}
      >
        <div className="relative w-full h-full">
          <AspectRatio ratio={1}>
            <img
              src={imageUrl}
              alt="Product"
              className="object-contain w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const container = target.parentElement;
                if (container) {
                  const fallback = document.createElement('div');
                  fallback.className = "absolute inset-0 flex items-center justify-center bg-gray-100";
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                  fallback.appendChild(icon);
                  container.appendChild(fallback);
                }
              }}
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-1 text-white hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </AspectRatio>
        </div>
      </DialogContent>
    </Dialog>
  );
};
