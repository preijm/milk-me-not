
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { CameraOptions } from "./camera/CameraOptions";
import { useCameraCapabilities } from "@/hooks/useCameraCapabilities";
import { useCameraOperations } from "@/hooks/useCameraOperations";

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
  
  const { hasCameraSupport, isNativeApp, isSamsungBrowser, isMobile } = useCameraCapabilities();
  
  const {
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    handleTakePhoto,
    handleChooseFromGallery
  } = useCameraOperations({
    setPicture,
    setPicturePreview,
    isNativeApp,
    isSamsungBrowser
  });

  const removePicture = () => {
    setPicture(null);
    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
      setPicturePreview(null);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
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
          <div className="w-full h-full min-h-[120px] flex items-center justify-center">
            <CameraOptions
              onTakePhoto={handleTakePhoto}
              onChooseFromGallery={handleChooseFromGallery}
              isNativeApp={isNativeApp}
              hasCameraSupport={hasCameraSupport}
            />
          </div>
        </div>
      )}
    </div>
  );
};
