
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcodeData: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  open, 
  onClose, 
  onScan 
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogDescription className="sr-only">
          Scan a barcode to identify a milk product
        </DialogDescription>
        <div className="text-center">
          <h3 className="text-lg font-medium">Scan Barcode</h3>
          <p className="text-sm text-gray-500">
            Position the barcode within the scanner
          </p>
        </div>
        
        <div className="mt-4 flex flex-col items-center">
          {/* Barcode scanning implementation would go here */}
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 w-full h-48 flex items-center justify-center">
            <p className="text-gray-500">Barcode scanner would appear here</p>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={() => onScan("4006298001234")} type="button">
              Simulate Scan
            </Button>
            <Button onClick={onClose} variant="outline" type="button">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPicture(file);
      setPicturePreview(URL.createObjectURL(file));
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
    <div className="flex flex-col items-center">
      {picturePreview ? (
        <div className="relative">
          <img 
            src={picturePreview} 
            alt="Milk product" 
            className="w-32 min-h-[80px] h-full object-cover rounded-md cursor-pointer"
            onClick={() => setIsImageDialogOpen(true)}
          />
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
        <div className="flex flex-col gap-2 items-center">
          {showCamera ? (
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-48 h-48 border rounded-md"
              />
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
                <Button onClick={takePicture} size="sm">Capture</Button>
                <Button onClick={stopCamera} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={startCamera}
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
