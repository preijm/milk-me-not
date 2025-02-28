
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
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!open) return;
      
      try {
        setIsScanning(true);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        scanBarcode();
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera Error",
          description: "Failed to access the camera. Please check permissions.",
          variant: "destructive",
        });
        setIsScanning(false);
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

    startCamera();

    return () => {
      setIsScanning(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, onScan, toast, isScanning]);

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
            <video 
              ref={videoRef} 
              className="absolute top-0 left-0 w-full h-full object-cover"
              playsInline
              muted
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
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Position the barcode within the camera view to scan automatically
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
