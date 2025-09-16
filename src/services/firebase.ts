import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue, getBoolean } from 'firebase/remote-config';

// Firebase configuration - loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-XRJNZ26X06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Remote Config
const remoteConfig = getRemoteConfig(app);

// Set configuration settings
remoteConfig.settings = {
  minimumFetchIntervalMillis: 10 * 60 * 1000, // 10 minutes
  fetchTimeoutMillis: 60 * 1000, // 1 minute timeout
};

// Set default values
remoteConfig.defaultConfig = {
  is_close: false,
  close_message: 'Sorry, we are temporarily closed. Please try again later.',
  close_title: 'Store Temporarily Closed',
  is_disable_checkout: false,
  // Default menu category configuration for feature flagging and ordering
  'config/categoty_config': JSON.stringify([
    { type: 'coffee', is_show: true, order: 0 },
    { type: 'tea', is_show: true, order: 1 },
    { type: 'soda', is_show: true, order: 2 },
    { type: 'sunkid', is_show: false, order: 3 }
  ]),
  // Default checkout form configuration
  'config/checkout_config': JSON.stringify([
    { input: 'name', required: true, is_show: true },
    { input: 'phone', required: false, is_show: true },
    { input: 'table', required: true, is_show: true },
    { input: 'notes', required: false, is_show: true }
  ]),
  // Default menu customization configuration
  'config/menu_customize': JSON.stringify({
    milk: [
      { type: 'normal', price: 0, enable: true },
      { type: 'oat', price: 0, enable: true }
    ],
    size: [
      { type: 'medium', price: 0, enable: true },
      { type: 'large', price: 0, enable: true }
    ]
  })
};

export { remoteConfig, fetchAndActivate, getValue, getBoolean };
export default app;
