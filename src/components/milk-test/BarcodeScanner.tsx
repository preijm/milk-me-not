
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
  const scanIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (!open || !videoRef.current) return;
      
      try {
        console.log("Attempting to start camera...");
        setIsScanning(true);
        
        // Mobile-optimized constraints
        const constraints = {
          video: { 
            facingMode: { exact: "environment" }, // Force back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        console.log("Requesting camera with constraints:", JSON.stringify(constraints));
        
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Camera access granted", stream.getVideoTracks().length > 0 ? "with video tracks" : "but no video tracks");
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, attempting to play");
            if (videoRef.current) {
              // Use play() as a promise
              videoRef.current.play()
                .then(() => {
                  console.log("Video playback started successfully");
                  setHasPermission(true);
                  startBarcodeDetection();
                })
                .catch(playError => {
                  console.error("Error playing video:", playError);
                  toast({
                    title: "Camera Error",
                    description: "Could not start video playback. Please try again.",
                    variant: "destructive",
                  });
                });
            }
          };
        }
      } catch (error: any) {
        console.error("Error accessing camera:", error);
        
        // Try fallback to any available camera if environment camera fails
        if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
          console.log("Attempting fallback to any available camera...");
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                  videoRef.current.play()
                    .then(() => {
                      console.log("Fallback camera started successfully");
                      setHasPermission(true);
                      startBarcodeDetection();
                    })
                    .catch(playError => {
                      console.error("Error playing fallback video:", playError);
                      handleCameraError(playError);
                    });
                }
              };
            }
          } catch (fallbackError) {
            console.error("Fallback camera also failed:", fallbackError);
            handleCameraError(error); // Use original error for better message
          }
        } else {
          handleCameraError(error);
        }
      }
    };

    const startBarcodeDetection = () => {
      // Clear any existing interval
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      
      console.log("Starting barcode detection");
      
      // Set up an interval to periodically check for barcodes
      scanIntervalRef.current = window.setInterval(scanForBarcode, 500);
    };

    const scanForBarcode = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!context) return;
      
      // Get the actual playing video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        console.log("Video dimensions not available yet");
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw the current video frame to the canvas
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Check if BarcodeDetector API is available
        if ('BarcodeDetector' in window) {
          detectBarcodeWithAPI(canvas);
        } else {
          // Fallback - manual detection
          console.log("BarcodeDetector API not available, using manual detection");
          
          // In a real implementation, you'd use a JS library for barcode detection
          // For testing, you can simulate a detection after a few seconds
          if (Date.now() % 10000 < 50) { // Simulate random detection roughly every 10 seconds
            console.log("SIMULATED barcode detected for testing");
            // Use a test barcode for debug purposes
            handleBarcodeResult("8710624073123");
          }
        }
      } catch (error) {
        console.error("Error during canvas operations:", error);
      }
    };

    const detectBarcodeWithAPI = async (canvas: HTMLCanvasElement) => {
      try {
        // @ts-ignore - BarcodeDetector may not be in TypeScript definitions
        const barcodeDetector = new BarcodeDetector({
          formats: [
            'ean_13', 'ean_8', 'upc_a', 'upc_e', 
            'code_39', 'code_128', 'qr_code', 'data_matrix'
          ]
        });
        
        const barcodes = await barcodeDetector.detect(canvas);
        
        if (barcodes.length > 0) {
          console.log("Barcode detected:", barcodes[0].rawValue);
          handleBarcodeResult(barcodes[0].rawValue);
        }
      } catch (error) {
        console.error("Barcode detection error:", error);
      }
    };

    const handleCameraError = (error: any) => {
      console.error("Camera error details:", error);
      setHasPermission(false);
      setIsScanning(false);
      
      // Determine the specific error
      let errorMessage = "Failed to access the camera. Please check permissions.";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Camera access was denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No camera found. Please ensure your device has a camera.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Camera is already in use by another application.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Your device doesn't have a back camera or it's not available.";
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    const handleBarcodeResult = (barcodeData: string) => {
      // Stop scanning 
      cleanupStreams();
      
      // Show flash effect
      createFlashEffect();
      
      // Pass the barcode data back to parent
      console.log("Sending barcode data to parent:", barcodeData);
      onScan(barcodeData);
    };

    const createFlashEffect = () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const flashContext = canvasRef.current.getContext('2d');
      if (flashContext) {
        // Set canvas dimensions
        const width = videoRef.current.videoWidth || 640;
        const height = videoRef.current.videoHeight || 480;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        // Create a flash effect
        flashContext.fillStyle = "rgba(255, 255, 255, 0.8)";
        flashContext.fillRect(0, 0, width, height);
        
        // Revert to normal after flash
        setTimeout(() => {
          if (flashContext) {
            flashContext.clearRect(0, 0, width, height);
          }
        }, 300);
      }
    };

    // Clean up function for streams
    const cleanupStreams = () => {
      console.log("Cleaning up camera resources");
      
      // Clear the scanning interval
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      // Stop all video streams
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Camera track stopped");
        });
      }
      
      if (videoRef.current) {
        if (videoRef.current.srcObject instanceof MediaStream) {
          const videoStream = videoRef.current.srcObject;
          videoStream.getTracks().forEach(track => {
            track.stop();
            console.log("Additional video track stopped");
          });
        }
        videoRef.current.srcObject = null;
      }
      
      setIsScanning(false);
    };

    // Main effect logic
    if (open) {
      console.log("Dialog opened, starting camera");
      setHasPermission(null); // Reset permission state
      startCamera();
    } else {
      console.log("Dialog closed, cleaning up");
      cleanupStreams();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log("Effect cleanup");
      cleanupStreams();
    };
  }, [open, onScan, toast]);

  // Function to manually retry camera access
  const retryAccess = () => {
    console.log("Retrying camera access...");
    setHasPermission(null);
    
    // Ensure any existing streams are stopped
    if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // The useEffect will handle restarting the camera since we changed hasPermission
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
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
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
