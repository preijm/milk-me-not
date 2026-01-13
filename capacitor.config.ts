import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.mondriaangoose',
  appName: 'mondriaan-goose',
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