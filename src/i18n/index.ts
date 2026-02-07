/**
 * i18next 설정
 * 한국어(기본) / 영어 지원
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from './ko.json';
import en from './en.json';

// 브라우저 언어 감지
function detectLanguage(): string {
  // localStorage에서 저장된 언어 확인
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'ko' || saved === 'en')) {
      return saved;
    }
    // 브라우저 언어 감지
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) {
      return 'ko';
    }
  }
  return 'ko'; // 기본값: 한국어
}

// i18next 초기화
i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false, // React에서는 XSS 방지가 기본 제공
  },
});

// 언어 변경 시 localStorage에 저장
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
