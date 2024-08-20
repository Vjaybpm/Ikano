import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


const translationEN = require ( './translations.en.json' );


// The translation resources
const resources = {
  en: {
    translation: translationEN,
  },
};

i18n
  // Pass the i18n instance to react-i18next.
  .use ( initReactI18next )
  // Automatic language detection
  .use ( LanguageDetector )
  .init ( {
    resources,
    fallbackLng: 'en', // Use 'en' if detected lang is not available

    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    detection: {
      order: [ 'querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain' ],
      caches: [ 'cookie' ], // Store the detected language in cookies
    },
  } );

// Named export
export { i18n };
