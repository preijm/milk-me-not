
import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcodeData: string) => void;
}

export const BarcodeScanner = ({ open, onClose, onScan }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!open) return;
      
      try {
        setIsScanning(true);
        
        // Request camera permission
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        setHasPermission(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        // Start barcode scanning after camera is initialized
        setTimeout(() => {
          scanBarcode();
        }, 1000);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasPermission(false);
        setIsScanning(false);
        
        // Determine the specific error
        let errorMessage = "Failed to access the camera. Please check permissions.";
        
        // @ts-ignore
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Camera access was denied. Please allow camera access in your browser settings.";
        // @ts-ignore
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          errorMessage = "No camera found. Please ensure your device has a camera.";
        // @ts-ignore
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          errorMessage = "Camera is already in use by another application.";
        // @ts-ignore
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera constraints are not satisfied. Try a different camera.";
        }
        
        toast({
          title: "Camera Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    const scanBarcode = async () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;
      
      // In a real implementation, you would use a barcode scanning library like ZXing or Quagga
      // For this example, we're simulating a successful scan
      
      // Wait a bit to simulate scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a barcode scan result
      const mockBarcode = "3017620422003"; // Example barcode (Nutella)
      
      // Pass the barcode data back
      onScan(mockBarcode);
      
      // Stop scanning after successful scan
      setIsScanning(false);
    };

    if (open) {
      // Reset states when opening
      setHasPermission(null);
      startCamera();
    } else {
      // Clean up when closing
      setIsScanning(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      setIsScanning(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, onScan, toast]);

  // Function to manually retry camera access
  const retryAccess = () => {
    setHasPermission(null);
    setIsScanning(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Product Barcode</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden">
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-white">
                <p className="text-center">Camera access denied or unavailable</p>
                <Button onClick={retryAccess} variant="secondary" size="sm">
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full"
                />
                {isScanning && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                    <Camera className="h-8 w-8 animate-pulse" />
                  </div>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {hasPermission === false 
              ? "Please allow camera access in your browser settings" 
              : "Position the barcode within the camera view to scan automatically"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
