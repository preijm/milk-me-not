import { Capacitor } from '@capacitor/core';

/**
 * Robust native app detection that handles edge cases where
 * Capacitor.isNativePlatform() might return false incorrectly
 * (e.g., when loading remote URLs, after WebView reload, etc.)
 */
export const isNativeApp = (): boolean => {
  // Method 0: Check for nativeApp=true URL parameter (most reliable for remote URL loading)
  const hasNativeAppParam = typeof window !== 'undefined' && 
    window.location.search.includes('nativeApp=true');
  
  if (hasNativeAppParam) {
    console.log('[PlatformDetection] ✓ Detected as native via nativeApp=true URL parameter');
    return true;
  }

  const detectionResults = {
    isNativePlatform: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
    windowCapacitorIsNative: typeof window !== 'undefined' ? (window as any).Capacitor?.isNative : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    userAgentContainsCapacitor: typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().includes('capacitor') : false,
  };

  console.log('[PlatformDetection] Detection check:', detectionResults);

  // Method 1: Standard Capacitor check
  if (detectionResults.isNativePlatform) {
    console.log('[PlatformDetection] ✓ Detected as native via Capacitor.isNativePlatform()');
    return true;
  }
  
  // Method 2: Check Capacitor platform (not 'web')
  if (detectionResults.platform !== 'web') {
    console.log('[PlatformDetection] ✓ Detected as native via Capacitor.getPlatform():', detectionResults.platform);
    return true;
  }
  
  // Method 3: Check for Capacitor bridge in window object
  if (detectionResults.windowCapacitorIsNative) {
    console.log('[PlatformDetection] ✓ Detected as native via window.Capacitor.isNative');
    return true;
  }
  
  // Method 4: Check user agent for Capacitor native bridge
  if (detectionResults.userAgentContainsCapacitor) {
    console.log('[PlatformDetection] ✓ Detected as native via userAgent containing "capacitor"');
    return true;
  }
  
  console.log('[PlatformDetection] ✗ Not detected as native app, running as web');
  return false;
};
