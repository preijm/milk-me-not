import { Capacitor } from '@capacitor/core';

/**
 * Robust native app detection that handles edge cases where
 * Capacitor.isNativePlatform() might return false incorrectly
 * (e.g., when loading remote URLs, after WebView reload, etc.)
 */
export const isNativeApp = (): boolean => {
  // Method 1: Standard Capacitor check
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  
  // Method 2: Check Capacitor platform (not 'web')
  if (Capacitor.getPlatform() !== 'web') {
    return true;
  }
  
  // Method 3: Check for Capacitor bridge in window object
  // This exists when running inside the native WebView
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNative) {
    return true;
  }
  
  // Method 4: Check user agent for Capacitor native bridge
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('capacitor')) {
      return true;
    }
  }
  
  return false;
};
