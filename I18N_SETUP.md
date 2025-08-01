# Thai Language Translation Setup

This implementation adds Thai language support to the TIMING menu ordering app with Thai as the default language.

## Status

✅ Translation infrastructure set up
✅ Thai and English translation files created
✅ Components updated to use translations
✅ Thai set as default language
⚠️ i18n packages need to be installed (see installation steps below)

## Installation Steps

1. Install the required i18n packages:

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

2. Once packages are installed, update `/src/i18n/index.ts` to use the real i18n implementation:

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./locales/en.json";
import thTranslations from "./locales/th.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  th: {
    translation: thTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "th", // Default to Thai
    lng: "th", // Set Thai as default language
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
```

3. Update all component imports from `../i18n/stub` to `react-i18next`:
   - `src/components/Header.tsx`
   - `src/components/BottomNav.tsx`
   - `src/components/CartDrawer.tsx`
   - `src/pages/MenuPage.tsx`

## Features Implemented

### Default Language

- Thai is set as the default language
- Fallback to Thai if language detection fails
- Language preference stored in localStorage

### Translation Coverage

- Navigation elements (menu, cart, orders)
- Header titles for all pages
- Menu page (search, categories, menu cards)
- Cart functionality (empty state, totals, checkout)
- Loading states and common UI elements

### Language Files

- `/src/i18n/locales/th.json` - Thai translations
- `/src/i18n/locales/en.json` - English translations

### Components Updated

- Header component with dynamic titles and language toggle button
- Bottom navigation with translated labels
- Menu page with search, categories, and menu cards
- Cart drawer with translated text

### Language Toggle Feature

- Language toggle button in the header (Languages icon + current language indicator)
- Shows "EN" when Thai is active, "TH" when English is active
- Persists language choice in localStorage
- Tooltips in both languages for accessibility

## Current Implementation

The app currently uses a stub implementation that provides Thai translations by default. Once the npm packages are installed and the imports are updated, the full i18next functionality will be available.

## Testing

To test the Thai translations:

1. Install the i18n packages as described above
2. Update the imports in components
3. Start the development server: `npm run dev`
4. The app should display in Thai by default

## Adding More Translations

To add translations for additional components:

1. Add the new keys to both `th.json` and `en.json`
2. Import `useTranslation` hook in the component
3. Use `t('key.path')` to access translations
4. Use interpolation for dynamic values: `t('key', { count: 5 })`
