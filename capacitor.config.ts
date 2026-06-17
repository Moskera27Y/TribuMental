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
      clientId: '285411670721-hjuem1ghq6i4ppbl07ikbvi81iri3kba.apps.googleusercontent.com',
      serverClientId: '285411670721-hjuem1ghq6i4ppbl07ikbvi81iri3kba.apps.googleusercontent.com',
    },
  },
};

export default config;
