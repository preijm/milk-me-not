import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StoryButton, StoryDialogClose } from "@/components/story";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DesktopCameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const DesktopCameraModal: React.FC<DesktopCameraModalProps> = ({
  open,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera. Please check permissions.');
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        onCapture(file);
        handleClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  // startCamera is stable — omitting prevents restarting camera on unrelated renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // A viewfinder, not a card: the frame stays black so nothing competes with
  // what the lens is showing. Only the chrome around it is the site's.
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        closeButton={false}
        className="max-w-4xl overflow-hidden rounded-[1.5rem] border-0 bg-story-ink p-0"
      >
        <DialogTitle className="sr-only">Take a photo</DialogTitle>
        <div className="relative bg-black">
          <StoryDialogClose className="text-white/80 hover:bg-white/15 hover:text-white" />

          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                <p className="text-[0.9375rem]">Waking the camera…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 px-6">
              <div className="max-w-sm text-center">
                <p className="story-display text-[1.5rem] leading-tight text-white">The camera didn't open.</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/70">{error}</p>
                <StoryButton tone="paper" size="md" className="mt-6" onClick={startCamera}>
                  Try again
                </StoryButton>
              </div>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline muted className="h-auto max-h-[70vh] w-full object-cover" />

          <canvas ref={canvasRef} className="hidden" />

          {!isLoading && !error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <button
                type="button"
                onClick={capturePhoto}
                aria-label="Take the photo"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-story-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)] ring-4 ring-white/25 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-story-green"
              >
                <Camera className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
