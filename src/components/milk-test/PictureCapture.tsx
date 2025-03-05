
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
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePicture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "milk-picture.jpg", { type: "image/jpeg" });
        setPicture(file);
        setPicturePreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
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
          {showCamera ? (
            <div className="relative w-full h-full">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover rounded-md"
              />
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
                <Button onClick={takePicture} size="sm">Capture</Button>
                <Button onClick={stopCamera} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button 
              type="button" 
              variant="outline"
              className="w-full h-full min-h-[120px] flex items-center justify-center border-dashed"
              onClick={startCamera}
            >
              <Camera className="h-8 w-8 text-gray-400" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
