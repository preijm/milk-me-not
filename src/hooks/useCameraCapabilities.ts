
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { isNativeApp as checkIsNativeApp } from "@/lib/platformDetection";

export const useCameraCapabilities = () => {
  const [hasCameraSupport, setHasCameraSupport] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [isSamsungBrowser, setIsSamsungBrowser] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkCapabilities = async () => {
      // Check if running in a native app using robust detection
      const isNative = checkIsNativeApp();
      setIsNativeApp(isNative);
      
      // Check for Samsung browser
      const userAgent = navigator.userAgent.toLowerCase();
      const isSamsung = userAgent.includes('samsung') || userAgent.includes('samsungbrowser');
      setIsSamsungBrowser(isSamsung);
      
      if (isNative) {
        // Native app always has camera support
        setHasCameraSupport(true);
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Check camera permissions and availability on all devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          setHasCameraSupport(hasCamera);
        } catch (error) {
          console.log('Camera support check failed:', error);
          setHasCameraSupport(false);
        }
      } else {
        setHasCameraSupport(false);
      }
    };

    checkCapabilities();
  }, [isMobile]);

  return {
    hasCameraSupport,
    isNativeApp,
    isSamsungBrowser,
    isMobile
  };
};
