import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // A Play Store package ID can never change after the first upload, so this
  // is the real one, not Lovable's placeholder (com.lovable.mondriaangoose).
  appId: 'com.milkmenot.app',
  appName: 'Milk Me Not',
  webDir: 'dist',
  server: {
    url: 'https://534a6b8e-9504-4d1c-9f7f-e02ff5b37b5b.lovableproject.com?forceHideBadge=true&nativeApp=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;