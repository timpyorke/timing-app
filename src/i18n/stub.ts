// Temporary stub implementation until react-i18next is installed
import React from 'react';
import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';

const translations = {
  en: enTranslations,
  th: thTranslations,
};

// Initialize language from localStorage or default to Thai
let currentLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('i18nextLng') || 'th' 
  : 'th';
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const t = (key: string, options?: any): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage as keyof typeof translations];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value === 'string') {
    // Simple interpolation for {{key}} patterns
    if (options) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return options[key] !== undefined ? options[key] : match;
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
        }
      }
    }
  };
};

// Mock for initReactI18next
export const initReactI18next = () => ({
  init: () => Promise.resolve(),
});

// Mock for LanguageDetector
const LanguageDetector = {
  detect: () => 'th',
  init: () => {},
  type: 'languageDetector',
};

export default LanguageDetector;