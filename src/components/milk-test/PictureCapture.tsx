
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

interface PictureCaptureProps {
  picture: File | null;
  picturePreview: string | null;
  setPicture: (file: File | null) => void;
  setPicturePreview: (url: string | null) => void;
}

export const PictureCapture: React.FC<PictureCaptureProps> = ({
  picture,
  picturePreview,
  setPicture,
  setPicturePreview,
}) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPicture(file);
      setPicturePreview(previewUrl);
      
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    } catch (err) {
      console.error("Error handling selected picture:", err);
    }
  };

  const removePicture = () => {
    setPicture(null);
    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
      setPicturePreview(null);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Hidden file input that accepts camera capture and file selection */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {picturePreview ? (
        <div className="relative h-full w-full">
          <div className="h-full w-full rounded-md overflow-hidden">
            <img 
              src={picturePreview} 
              alt="Milk product" 
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsImageDialogOpen(true)}
            />
          </div>
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removePicture}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none">
              <DialogClose className="absolute right-4 top-4 rounded-sm bg-white/10 opacity-70 ring-offset-background z-10 hover:opacity-100" />
              <div className="relative w-full">
                <img 
                  src={picturePreview} 
                  alt="Milk product full view" 
                  className="w-full h-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Button 
            type="button" 
            variant="outline"
            className="w-full h-full min-h-[120px] flex items-center justify-center border-dashed"
            onClick={handleCameraClick}
          >
            <Camera className="h-8 w-8 text-gray-400" />
          </Button>
        </div>
      )}
    </div>
  );
};
