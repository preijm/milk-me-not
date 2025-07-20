import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Image } from "lucide-react";
interface CameraOptionsProps {
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  isNativeApp: boolean;
  hasCameraSupport: boolean;
}
export const CameraOptions: React.FC<CameraOptionsProps> = ({
  onTakePhoto,
  onChooseFromGallery,
  isNativeApp,
  hasCameraSupport
}) => {
  // Show different options based on capabilities
  if (isNativeApp) {
    return <div className="flex flex-col gap-2 w-full">
        <Button type="button" variant="outline" className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]" onClick={onTakePhoto}>
          <Camera className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-500">Take Photo</span>
        </Button>
        <Button type="button" variant="outline" className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]" onClick={onChooseFromGallery}>
          <Image className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-500">Choose from Gallery</span>
        </Button>
      </div>;
  }

  // For web browsers, provide both options
  return <div className="flex flex-col gap-2 w-full">
      {hasCameraSupport && <Button type="button" variant="outline" className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]" onClick={onTakePhoto}>
          <Camera className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-500">Take Photo</span>
        </Button>}
      <Button type="button" variant="outline" className="flex-1 flex flex-col items-center justify-center gap-2 border-dashed min-h-[60px]" onClick={onChooseFromGallery}>
        <Upload className="h-6 w-6 text-gray-400" />
        <span className="text-sm text-gray-500">Select Photo</span>
      </Button>
    </div>;
};