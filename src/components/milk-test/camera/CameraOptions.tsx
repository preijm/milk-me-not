import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Image, Loader2 } from "lucide-react";

interface CameraOptionsProps {
  onTakePhoto: () => Promise<void> | void;
  onChooseFromGallery: () => Promise<void> | void;
  isNativeApp: boolean;
  hasCameraSupport: boolean;
}

export const CameraOptions: React.FC<CameraOptionsProps> = ({
  onTakePhoto,
  onChooseFromGallery,
  isNativeApp,
  hasCameraSupport
}) => {
  const [isCapturing, setIsCapturing] = useState<'camera' | 'gallery' | null>(null);
  const cameraButtonRef = useRef<HTMLButtonElement>(null);
  const galleryButtonRef = useRef<HTMLButtonElement>(null);

  const handleTakePhoto = async () => {
    setIsCapturing('camera');
    try {
      await onTakePhoto();
    } finally {
      setIsCapturing(null);
      cameraButtonRef.current?.blur();
    }
  };

  const handleChooseFromGallery = async () => {
    setIsCapturing('gallery');
    try {
      await onChooseFromGallery();
    } finally {
      setIsCapturing(null);
      galleryButtonRef.current?.blur();
    }
  };

  const disabled = isCapturing !== null;

  if (isNativeApp) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          ref={cameraButtonRef}
          type="button"
          variant="outline"
          className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]"
          onClick={handleTakePhoto}
          disabled={disabled}
        >
          {isCapturing === 'camera' ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">Take Photo</span>
        </Button>
        <Button
          ref={galleryButtonRef}
          type="button"
          variant="outline"
          className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]"
          onClick={handleChooseFromGallery}
          disabled={disabled}
        >
          {isCapturing === 'gallery' ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          ) : (
            <Image className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">Choose from Gallery</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {hasCameraSupport && (
        <Button
          ref={cameraButtonRef}
          type="button"
          variant="outline"
          className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]"
          onClick={handleTakePhoto}
          disabled={disabled}
        >
          {isCapturing === 'camera' ? (
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">Take Photo</span>
        </Button>
      )}
      <Button
        ref={galleryButtonRef}
        type="button"
        variant="outline"
        className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]"
        onClick={handleChooseFromGallery}
        disabled={disabled}
      >
        {isCapturing === 'gallery' ? (
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-sm text-muted-foreground">Select Photo</span>
      </Button>
    </div>
  );
};
