/**
 * LegalSheet - 개인정보처리방침/이용약관 슬라이드업 시트
 * React Island (client:load)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from './content';
import { renderMarkdown } from '../../utils/renderMarkdown';

type SheetType = 'privacy' | 'terms' | null;

interface LegalSheetProps {
  initialOpen?: SheetType;
}

type AnimState = 'idle' | 'entering' | 'leaving';

export function LegalSheet({ initialOpen = null }: LegalSheetProps) {
  const [openSheet, setOpenSheet] = useState<SheetType>(initialOpen);
  const [animState, setAnimState] = useState<AnimState>('idle');
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const content = openSheet === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE;
  const title = openSheet === 'privacy' ? '개인정보처리방침' : '이용약관';

  // 시트 열기
  const openSheetByType = useCallback((type: SheetType) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setOpenSheet(type);
    setAnimState('entering');
  }, []);

  // 시트 닫기
  const closeSheet = useCallback(() => {
    setAnimState('leaving');
    setTimeout(() => {
      setOpenSheet(null);
      setAnimState('idle');
      // 포커스 복귀
      triggerRef.current?.focus();
    }, 200);
  }, []);

  // ESC 키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openSheet) {
        closeSheet();
      }
    };

    if (openSheet) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [openSheet, closeSheet]);

  // 애니메이션 완료 후 상태 업데이트
  useEffect(() => {
    if (openSheet && animState === 'entering') {
      const timer = setTimeout(() => setAnimState('idle'), 300);
      return () => clearTimeout(timer);
    }
  }, [openSheet, animState]);

  // 포커스 트랩
  useEffect(() => {
    if (openSheet && sheetRef.current) {
      const focusableElements = sheetRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [openSheet]);

  // 글로벌 이벤트 리스너 등록 (Footer 링크용)
  useEffect(() => {
    const handleOpenPrivacy = () => openSheetByType('privacy');
    const handleOpenTerms = () => openSheetByType('terms');

    window.addEventListener('open-privacy-policy', handleOpenPrivacy);
    window.addEventListener('open-terms-of-service', handleOpenTerms);

    return () => {
      window.removeEventListener('open-privacy-policy', handleOpenPrivacy);
      window.removeEventListener('open-terms-of-service', handleOpenTerms);
    };
  }, [openSheetByType]);

  if (!openSheet) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`legal-overlay ${animState === 'entering' ? 'legal-overlay-entering' : ''} ${animState === 'leaving' ? 'legal-overlay-leaving' : ''}`}
        onClick={closeSheet}
        aria-hidden="true"
      />

      {/* 시트 */}
      <div
        ref={sheetRef}
        className={`legal-sheet ${animState === 'entering' ? 'legal-sheet-entering' : ''} ${animState === 'leaving' ? 'legal-sheet-leaving' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-sheet-title"
      >
        {/* 헤더 */}
        <div className="legal-sheet-header">
          <h2 id="legal-sheet-title" className="legal-sheet-title">
            {title}
          </h2>
          <button
            type="button"
            className="legal-sheet-close"
            onClick={closeSheet}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="legal-sheet-content" tabIndex={0}>
          {renderMarkdown(content)}
        </div>
      </div>
    </>
  );
}

export default LegalSheet;
