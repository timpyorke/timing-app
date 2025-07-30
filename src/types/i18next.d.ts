declare module 'i18next' {
  const i18n: any;
  export default i18n;
}

declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string, options?: any) => string;
    i18n: any;
  };
  export function initReactI18next(): any;
}

declare module 'i18next-browser-languagedetector' {
  const LanguageDetector: any;
  export default LanguageDetector;
}