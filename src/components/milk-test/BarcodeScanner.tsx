import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, X } from "lucide-react";
import Quagga from "quagga";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcodeData: string) => void;
}

export const BarcodeScanner = ({ open, onClose, onScan }: BarcodeScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const cleanupQuagga = () => {
      console.log("Cleaning up QuaggaJS...");
      if (isScanning) {
        try {
          Quagga.stop();
        } catch (err) {
          console.error("Error stopping Quagga:", err);
        }
        setIsScanning(false);
      }
    };

    if (!open) {
      console.log("Dialog closed, cleaning up");
      cleanupQuagga();
      return;
    }

    console.log("Dialog opened, initializing scanner");
    setHasPermission(null);

    const initTimer = setTimeout(() => {
      if (!scannerRef.current) {
        console.error("Scanner reference not available");
        return;
      }

      console.log("Initializing QuaggaJS scanner...");
      
      setIsScanning(true);
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          
          Quagga.init({
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                facingMode: "environment",
                width: { min: 320, ideal: 640, max: 1280 },
                height: { min: 240, ideal: 480, max: 720 },
                aspectRatio: { min: 1, max: 2 }
              },
            },
            locator: {
              patchSize: "medium",
              halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
              readers: [
                "ean_reader",
                "ean_8_reader",
                "upc_reader",
                "code_128_reader",
                "code_39_reader"
              ]
            },
            locate: true
          }, function(err) {
            if (err) {
              console.error("QuaggaJS initialization error:", err);
              setHasPermission(false);
              setIsScanning(false);
              
              toast({
                title: "Camera Error",
                description: "Could not access camera: " + err.message,
                variant: "destructive",
              });
              return;
            }
            
            console.log("QuaggaJS initialized successfully");
            setHasPermission(true);
            
            Quagga.start();
            
            if (scannerRef.current) {
              const videoEl = scannerRef.current.querySelector("video");
              if (videoEl) {
                videoEl.classList.add("w-full", "h-full", "object-cover");
                videoEl.style.position = "absolute";
                videoEl.style.top = "0";
                videoEl.style.left = "0";
              }
            }
          });

          Quagga.onDetected((result) => {
            if (result && result.codeResult && result.codeResult.code) {
              console.log("Barcode detected:", result.codeResult.code);
              handleBarcodeResult(result.codeResult.code);
            }
          });

          Quagga.onProcessed((result) => {
            if (!result) return;
            
            const drawingCanvas = document.querySelector('canvas.drawingBuffer') as HTMLCanvasElement;
            if (drawingCanvas) {
              drawingCanvas.style.position = 'absolute';
              drawingCanvas.style.top = '0';
              drawingCanvas.style.left = '0';
              drawingCanvas.style.width = '100%';
              drawingCanvas.style.height = '100%';
            }
          });
        })
        .catch(err => {
          console.error("Camera access denied:", err);
          setHasPermission(false);
          toast({
            title: "Camera Access Denied",
            description: "Please allow camera access to scan barcodes",
            variant: "destructive",
          });
        });
    }, 300);

    const handleBarcodeResult = (barcodeData: string) => {
      createFlashEffect();
      
      Quagga.stop();
      setIsScanning(false);
      
      console.log("Sending barcode data to parent:", barcodeData);
      onScan(barcodeData);
    };

    const createFlashEffect = () => {
      if (!scannerRef.current) return;
      
      const flashDiv = document.createElement('div');
      flashDiv.className = 'absolute inset-0 bg-white opacity-80 z-10';
      scannerRef.current.appendChild(flashDiv);
      
      setTimeout(() => {
        if (flashDiv.parentNode) {
          flashDiv.parentNode.removeChild(flashDiv);
        }
      }, 300);
    };

    return () => {
      clearTimeout(initTimer);
      cleanupQuagga();
    };
  }, [open, onScan, toast, isScanning]);

  const retryAccess = () => {
    console.log("Retrying camera access...");
    setHasPermission(null);
    
    try {
      Quagga.stop();
    } catch (err) {
      console.error("Error stopping Quagga before retry:", err);
    }
    
    setTimeout(() => {
      if (!scannerRef.current || !open) return;
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          
          Quagga.init({
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                facingMode: "environment"
              },
            },
            decoder: {
              readers: ["ean_reader", "ean_8_reader", "upc_reader"]
            }
          }, function(err) {
            if (err) {
              console.error("Retry failed:", err);
              setHasPermission(false);
              toast({
                title: "Camera Error",
                description: "Still unable to access camera after retry.",
                variant: "destructive",
              });
              return;
            }
            
            setHasPermission(true);
            setIsScanning(true);
            Quagga.start();
          });
        })
        .catch(err => {
          console.error("Retry camera access failed:", err);
          setHasPermission(false);
          toast({
            title: "Camera Access Denied",
            description: "Please check your browser camera permissions",
            variant: "destructive",
          });
        });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" closeButton={false}>
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
            {hasPermission !== false ? (
              <div 
                ref={scannerRef} 
                className="absolute inset-0 overflow-hidden bg-black"
              >
                {isScanning && hasPermission !== false && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-white">
                    <Camera className="h-8 w-8 animate-pulse" />
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-white">
                <p className="text-center">Camera access denied or unavailable</p>
                <Button onClick={retryAccess} variant="secondary" size="sm">
                  Retry
                </Button>
              </div>
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
