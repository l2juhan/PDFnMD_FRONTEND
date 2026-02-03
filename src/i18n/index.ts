import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './ko.json';
import en from './en.json';

const STORAGE_KEY = 'pdfnmd_language';
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const getSavedLanguage = (): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const defaultLanguage = getSavedLanguage() || 'ko';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: defaultLanguage,
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', (lng: string) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    // localStorage 접근 실패 시 무시
  }
});

export default i18n;
