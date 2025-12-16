import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brooklynwebdesign.calendar',
  appName: 'Calendar app L&S',
  webDir: '.output/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
