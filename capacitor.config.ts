import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tribumental.app',
  appName: 'TribuMental',
  webDir: 'dist',
  server: {
    url: 'https://tribumental.onrender.com',
    cleartext: true
  },
  plugins: {
    GoogleSignIn: {
      clientId: '285411670721-h00bcmo1u4lr74ef64ttordrvbu5oane.apps.googleusercontent.com',
      serverClientId: '285411670721-h00bcmo1u4lr74ef64ttordrvbu5oane.apps.googleusercontent.com',
    },
  },
};

export default config;
