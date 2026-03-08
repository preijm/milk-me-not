
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
  isMobile: boolean;
}

export const useCameraOperations = ({
  setPicture,
  setPicturePreview,
  isNativeApp,
  isSamsungBrowser,
  isMobile
}: UseCameraOperationsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showDesktopCamera, setShowDesktopCamera] = useState(false);
  const { toast } = useToast();

  const processAndSetFile = async (file: File, previewUrl: string) => {
    try {
      // Check if compression is needed (only for files larger than 5MB)
      if (shouldCompress(file, 5 * 1024 * 1024)) {
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

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const status = await CapacitorCamera.checkPermissions();
      console.log('[Camera] Current permissions:', status);
      
      if (status.camera === 'denied') {
        toast({
          title: "Camera Permission Required",
          description: "Please enable camera access in your device settings for this app.",
          variant: "destructive",
        });
        return false;
      }
      
      if (status.camera !== 'granted') {
        const requested = await CapacitorCamera.requestPermissions({ permissions: ['camera'] });
        console.log('[Camera] Requested permissions result:', requested);
        
        if (requested.camera !== 'granted') {
          toast({
            title: "Camera Permission Denied",
            description: "Camera access is needed to take photos. Please allow it in your device settings.",
            variant: "destructive",
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.warn('[Camera] Permission check failed:', error);
      return true; // Proceed anyway, getPhoto will handle the error
    }
  };

  const takePictureWithNativeCamera = async (): Promise<boolean> => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return false;

      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (!image.dataUrl) {
        return false;
      }

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
        return false;
      }

      await processAndSetFile(file, image.dataUrl);
      return true;
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('cancel') || msg.includes('user') || msg.includes('dismissed') || error?.code === 'RESULT_CANCELED') {
        console.log('[Camera] User cancelled native camera');
        return true; // Return true to prevent fallback to file input
      }
      console.warn('[Camera] Native camera unavailable, falling back to web capture:', error);
      return false;
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

  const isCapacitorAvailable = () => {
    try {
      return !!(window as any).Capacitor?.isNativePlatform?.();
    } catch {
      return false;
    }
  };

  const handleTakePhoto = async () => {
    // Always attempt native camera first in native app environments.
    if (isNativeApp) {
      const captured = await takePictureWithNativeCamera();
      if (captured) return;
    }

    // On mobile/webview, rely on file input capture directly from user gesture.
    if (isMobile || isSamsungBrowser || (isNativeApp && !isCapacitorAvailable())) {
      cameraInputRef.current?.click();
      return;
    }

    // Desktop web fallback.
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowDesktopCamera(true);
      return;
    }

    cameraInputRef.current?.click();
  };

  const handleChooseFromGallery = async () => {
    if (isNativeApp) {
      const selected = await takePictureWithGallery();
      if (selected) return;
    }

    fileInputRef.current?.click();
  };

  const takePictureWithGallery = async (): Promise<boolean> => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (!image.dataUrl) {
        return false;
      }

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
        return false;
      }

      await processAndSetFile(file, image.dataUrl);
      return true;
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('cancel') || msg.includes('user') || msg.includes('dismissed') || error?.code === 'RESULT_CANCELED') {
        console.log('[Camera] User cancelled native gallery');
        return true; // Return true to prevent fallback
      }
      console.warn('[Camera] Native gallery unavailable, falling back to file picker:', error);
      return false;
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
