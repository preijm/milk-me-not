import React, { useState, useRef } from "react";
import { Camera, Upload, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One tile, used up to four times below.
 *
 * This file previously repeated the same `Button variant="outline"` four
 * times, each carrying `text-muted-foreground` from the pre-redesign palette
 * against a dashed shadcn outline — the pair of grey boxes that sat under the
 * tasting notes looking like they came from another application.
 */
const CaptureTile = React.forwardRef<
  HTMLButtonElement,
  { icon: React.ElementType; label: string; busy: boolean; disabled: boolean; onClick: () => void }
>(({ icon: Icon, label, busy, disabled, onClick }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl",
      "border-[1.5px] border-dashed border-story-ink/[0.18] bg-white/60 text-story-muted transition-colors",
      "hover:border-story-green hover:bg-story-green-wash hover:text-story-green-dark",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-green",
      "disabled:pointer-events-none disabled:opacity-50",
    )}
  >
    {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
    <span className="text-[0.8125rem] font-bold">{label}</span>
  </button>
));
CaptureTile.displayName = "CaptureTile";

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
      <div className="flex w-full flex-col gap-2">
        <CaptureTile ref={cameraButtonRef} icon={Camera} label="Take photo" busy={isCapturing === 'camera'} disabled={disabled} onClick={handleTakePhoto} />
        <CaptureTile ref={galleryButtonRef} icon={Image} label="Choose from gallery" busy={isCapturing === 'gallery'} disabled={disabled} onClick={handleChooseFromGallery} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {hasCameraSupport && (
        <CaptureTile ref={cameraButtonRef} icon={Camera} label="Take photo" busy={isCapturing === 'camera'} disabled={disabled} onClick={handleTakePhoto} />
      )}
      <CaptureTile ref={galleryButtonRef} icon={Upload} label="Select photo" busy={isCapturing === 'gallery'} disabled={disabled} onClick={handleChooseFromGallery} />
    </div>
  );
};
