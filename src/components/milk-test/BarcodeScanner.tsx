
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
    // Clean up Quagga when component unmounts or dialog closes
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

    // Only initialize when the dialog is open
    if (!open) {
      console.log("Dialog closed, cleaning up");
      cleanupQuagga();
      return;
    }

    console.log("Dialog opened, initializing scanner");
    setHasPermission(null); // Reset permission state

    // Initialize Quagga with a slight delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (!scannerRef.current) {
        console.error("Scanner reference not available");
        return;
      }

      console.log("Initializing QuaggaJS scanner...");
      
      setIsScanning(true);
      
      // First check if we can access the camera
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          // Stop the temp stream immediately
          stream.getTracks().forEach(track => track.stop());
          
          // Now initialize Quagga
          Quagga.init({
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                facingMode: "environment",
                // Don't use excessive resolution as it can cause performance issues
                width: { min: 320, ideal: 640, max: 1280 },
                height: { min: 240, ideal: 480, max: 720 },
                aspectRatio: { min: 1, max: 2 }
              },
            },
            locator: {
              patchSize: "medium",
              halfSample: true
            },
            numOfWorkers: 2, // Lower for better performance on mobile
            frequency: 10, // How often to scan for barcodes
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
            
            // Start detection once initialized
            Quagga.start();
            
            // Add appropriate styles to video element
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

          // Set up barcode detection handlers
          Quagga.onDetected((result) => {
            if (result && result.codeResult && result.codeResult.code) {
              console.log("Barcode detected:", result.codeResult.code);
              handleBarcodeResult(result.codeResult.code);
            }
          });

          // Set up processed handler for debugging
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
    }, 300); // Small delay to ensure DOM is ready

    const handleBarcodeResult = (barcodeData: string) => {
      // Play a beep sound or create a flash effect
      createFlashEffect();
      
      // Clean up Quagga
      Quagga.stop();
      setIsScanning(false);
      
      // Send barcode data to parent
      console.log("Sending barcode data to parent:", barcodeData);
      onScan(barcodeData);
    };

    const createFlashEffect = () => {
      if (!scannerRef.current) return;
      
      // Create a flash effect div
      const flashDiv = document.createElement('div');
      flashDiv.className = 'absolute inset-0 bg-white opacity-80 z-10';
      scannerRef.current.appendChild(flashDiv);
      
      // Remove the flash effect after a short delay
      setTimeout(() => {
        if (flashDiv.parentNode) {
          flashDiv.parentNode.removeChild(flashDiv);
        }
      }, 300);
    };

    // Cleanup on unmount
    return () => {
      clearTimeout(initTimer);
      cleanupQuagga();
    };
  }, [open, onScan, toast, isScanning]);

  // Function to manually retry camera access
  const retryAccess = () => {
    console.log("Retrying camera access...");
    setHasPermission(null);
    
    // Ensure Quagga is stopped before retrying
    try {
      Quagga.stop();
    } catch (err) {
      console.error("Error stopping Quagga before retry:", err);
    }
    
    // Allow a small delay before re-initializing
    setTimeout(() => {
      if (!scannerRef.current || !open) return;
      
      // First try to get camera access
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          // Stop the test stream immediately
          stream.getTracks().forEach(track => track.stop());
          
          // Now initialize Quagga
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
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-white">
                <p className="text-center">Camera access denied or unavailable</p>
                <Button onClick={retryAccess} variant="secondary" size="sm">
                  Retry
                </Button>
              </div>
            ) : (
              <div 
                ref={scannerRef} 
                className="absolute inset-0 overflow-hidden bg-black"
              >
                {/* Only show camera icon when scanning is active and permission isn't false */}
                {isScanning && hasPermission !== false && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-white">
                    <Camera className="h-8 w-8 animate-pulse" />
                  </div>
                )}
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
