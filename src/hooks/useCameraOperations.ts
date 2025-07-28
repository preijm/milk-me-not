
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { validateFile } from "@/lib/fileValidation";
import { progressiveCompress, shouldCompress } from "@/lib/imageCompression";

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
  const [showDesktopCamera, setShowDesktopCamera] = useState(false);
  const { toast } = useToast();

  const processAndSetFile = async (file: File, previewUrl: string) => {
    try {
      // Check if compression is needed
      if (shouldCompress(file)) {
        toast({
          title: "Compressing Image",
          description: "Optimizing image size for better performance...",
        });
        
        const compressedFile = await progressiveCompress(file);
        setPicture(compressedFile);
        
        // Update preview with compressed image if significantly smaller
        if (compressedFile.size < file.size * 0.8) {
          const compressedPreviewUrl = URL.createObjectURL(compressedFile);
          setPicturePreview(compressedPreviewUrl);
          URL.revokeObjectURL(previewUrl); // Clean up original preview
        } else {
          setPicturePreview(previewUrl);
        }
        
        toast({
          title: "Image Optimized",
          description: `File size reduced from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`,
        });
      } else {
        setPicture(file);
        setPicturePreview(previewUrl);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // Fallback to original file if compression fails
      setPicture(file);
      setPicturePreview(previewUrl);
    }
  };

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

        await processAndSetFile(file, image.dataUrl);
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
      await processAndSetFile(file, previewUrl);
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

  const handleDesktopCameraCapture = async (file: File) => {
    try {
      const validationResult = await validateFile(file);
      
      if (!validationResult.isValid) {
        toast({
          title: "Invalid File",
          description: validationResult.error,
          variant: "destructive",
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      await processAndSetFile(file, previewUrl);
    } catch (err) {
      console.error("Error handling camera capture:", err);
      toast({
        title: "Capture Error",
        description: "Failed to process the captured photo",
        variant: "destructive",
      });
    }
  };

  const handleTakePhoto = () => {
    if (isNativeApp) {
      takePictureWithNativeCamera();
    } else {
      // Check if we have camera access available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setShowDesktopCamera(true);
      } else {
        // Fallback to file input for older browsers
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
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

        await processAndSetFile(file, image.dataUrl);
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
    handleChooseFromGallery,
    showDesktopCamera,
    setShowDesktopCamera,
    handleDesktopCameraCapture
  };
};
