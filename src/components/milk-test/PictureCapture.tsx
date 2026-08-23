
import React, { useState } from "react";
import { X } from "lucide-react";
import { ImageModal } from "./ImageModal";
import { CameraOptions } from "./camera/CameraOptions";
import { DesktopCameraModal } from "./camera/DesktopCameraModal";
import { useCameraCapabilities } from "@/hooks/useCameraCapabilities";
import { useCameraOperations } from "@/hooks/useCameraOperations";

interface PictureCaptureProps {
  picture: File | null;
  picturePreview: string | null;
  setPicture: (file: File | null) => void;
  setPicturePreview: (url: string | null) => void;
}

export const PictureCapture: React.FC<PictureCaptureProps> = ({
  picture: _picture,
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
    handleChooseFromGallery,
    showDesktopCamera,
    setShowDesktopCamera,
    handleDesktopCameraCapture
  } = useCameraOperations({
    setPicture,
    setPicturePreview,
    isNativeApp,
    isSamsungBrowser,
    isMobile
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
          {/* Removing your own photo is not a destructive act — it was red. */}
          <button
            type="button"
            onClick={removePicture}
            aria-label="Remove photo"
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-story-ink text-story-cream shadow-[0_4px_12px_-4px_rgba(27,36,33,0.8)] transition-[filter] hover:brightness-125 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* The same lightbox the rest of the site uses, rather than a second one. */}
          <ImageModal
            isOpen={isImageDialogOpen}
            onClose={() => setIsImageDialogOpen(false)}
            imageUrl={picturePreview}
          />
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
      
      <DesktopCameraModal
        open={showDesktopCamera}
        onClose={() => setShowDesktopCamera(false)}
        onCapture={handleDesktopCameraCapture}
      />
    </div>
  );
};
