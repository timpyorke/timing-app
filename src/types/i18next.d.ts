declare module 'i18next' {
  interface I18nInstance {
    language: string;
    changeLanguage: (lng: string) => void;
  }
  const i18n: I18nInstance;
  export default i18n;
}

declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string, options?: Record<string, string | number>) => string;
    i18n: {
      language: string;
      changeLanguage: (lng: string) => void;
    };
  };
  export function initReactI18next(): {
    init: () => Promise<void>;
  };
}

declare module 'i18next-browser-languagedetector' {
  interface LanguageDetector {
    detect: () => string;
    init: () => void;
    type: string;
  }
  const LanguageDetector: LanguageDetector;
  export default LanguageDetector;
}