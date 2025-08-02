import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue, getBoolean } from 'firebase/remote-config';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
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
  close_title: 'Store Temporarily Closed'
};

export { remoteConfig, fetchAndActivate, getValue, getBoolean };
export default app;