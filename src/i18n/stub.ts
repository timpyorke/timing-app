// Temporary stub implementation until react-i18next is installed
import React from 'react';
import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';

type TranslationValue = string | Record<string, unknown>;
type TranslationOptions = Record<string, string | number>;

const translations = {
  en: enTranslations,
  th: thTranslations,
};

// Initialize language from localStorage or default to Thai
let currentLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('i18nextLng') || 'th' 
  : 'th';
let listeners: (() => void)[] = [];
let languageChangeListeners: ((newLanguage: string) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const notifyLanguageChangeListeners = (newLanguage: string) => {
  languageChangeListeners.forEach(listener => listener(newLanguage));
};

const t = (key: string, options?: TranslationOptions): string => {
  const keys = key.split('.');
  let value: TranslationValue = translations[currentLanguage as keyof typeof translations];
  
  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k] as TranslationValue;
    } else {
      return key; // Return key if path doesn't exist
    }
  }
  
  if (typeof value === 'string') {
    // Simple interpolation for {{key}} patterns
    if (options) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return options[key] !== undefined ? String(options[key]) : match;
      });
    }
    return value;
  }
  
  return key; // Fallback to key if translation not found
};

export const useTranslation = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  React.useEffect(() => {
    listeners.push(forceUpdate);
    return () => {
      listeners = listeners.filter(listener => listener !== forceUpdate);
    };
  }, []);

  return {
    t,
    i18n: {
      language: currentLanguage,
      changeLanguage: (lng: string) => {
        if (lng !== currentLanguage) {
          currentLanguage = lng;
          // Store in localStorage
          localStorage.setItem('i18nextLng', lng);
          notifyListeners();
          notifyLanguageChangeListeners(lng);
        }
      }
    }
  };
};

// Mock for initReactI18next
export const initReactI18next = () => ({
  init: () => Promise.resolve(),
});

// Function to subscribe to language changes
export const subscribeToLanguageChange = (callback: (newLanguage: string) => void) => {
  languageChangeListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    languageChangeListeners = languageChangeListeners.filter(listener => listener !== callback);
  };
};

// Mock for LanguageDetector
const LanguageDetector = {
  detect: () => 'th',
  init: () => {},
  type: 'languageDetector',
};

export default LanguageDetector;