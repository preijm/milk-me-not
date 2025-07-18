
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { validateFile } from "@/lib/fileValidation";

interface UseCameraOperationsProps {
  setPicture: (file: File | null) => void;
  setPicturePreview: (url: string | null) => void;
  isNativeApp: boolean;
  isSamsungBrowser: boolean;
}

export const useCameraOperations = ({
  setPicture,
  setPicturePreview,
  isNativeApp,
  isSamsungBrowser
}: UseCameraOperationsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const takePictureWithNativeCamera = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        
        const validationResult = await validateFile(file);
        
        if (!validationResult.isValid) {
          toast({
            title: "Invalid File",
            description: validationResult.error,
            variant: "destructive",
          });
          return;
        }

        setPicture(file);
        setPicturePreview(image.dataUrl);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const validationResult = await validateFile(file);
      
      if (!validationResult.isValid) {
        toast({
          title: "Invalid File",
          description: validationResult.error,
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setPicture(file);
      setPicturePreview(previewUrl);
      e.target.value = '';
    } catch (err) {
      console.error("Error handling selected picture:", err);
      toast({
        title: "File Error",
        description: "Failed to process the selected file",
        variant: "destructive",
      });
    }
  };

  const handleTakePhoto = () => {
    if (isNativeApp) {
      takePictureWithNativeCamera();
    } else {
      // For web browsers, use camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const handleChooseFromGallery = () => {
    if (isNativeApp) {
      // Use native gallery picker
      takePictureWithGallery();
    } else {
      // For web browsers, use file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const takePictureWithGallery = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'gallery-photo.jpg', { type: 'image/jpeg' });
        
        const validationResult = await validateFile(file);
        
        if (!validationResult.isValid) {
          toast({
            title: "Invalid File",
            description: validationResult.error,
            variant: "destructive",
          });
          return;
        }

        setPicture(file);
        setPicturePreview(image.dataUrl);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      toast({
        title: "Gallery Error",
        description: "Failed to select photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    handleTakePhoto,
    handleChooseFromGallery
  };
};
