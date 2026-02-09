/**
 * LegalSheet - 개인정보처리방침/이용약관 슬라이드업 시트
 * React Island (client:load)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from './content';

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

  // 인라인 볼드 처리 함수
  const renderInline = (text: string): React.ReactNode => {
    if (!text.includes('**')) return text;
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </>
    );
  };

  // 마크다운을 HTML로 변환 (간단한 변환)
  const renderMarkdown = (md: string) => {
    return md
      .split('\n')
      .map((line, i) => {
        // 헤딩
        if (line.startsWith('## ')) {
          return <h2 key={i} className="legal-h2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="legal-h1">{line.slice(2)}</h1>;
        }
        // 리스트 (볼드보다 먼저 체크 - 리스트 내 볼드 지원)
        if (line.startsWith('- ')) {
          return <p key={i} className="legal-li">• {renderInline(line.slice(2))}</p>;
        }
        if (/^\d+\. /.test(line)) {
          const match = line.match(/^(\d+)\./);
          const num = match ? match[1] : '';
          return <p key={i} className="legal-li">{num}. {renderInline(line.replace(/^\d+\. /, ''))}</p>;
        }
        // 볼드 (리스트가 아닌 경우)
        if (line.includes('**')) {
          return <p key={i} className="legal-p">{renderInline(line)}</p>;
        }
        // 구분선
        if (line === '---') {
          return <hr key={i} className="legal-hr" />;
        }
        // 이탤릭
        if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
          return <p key={i} className="legal-p legal-italic">{line.slice(1, -1)}</p>;
        }
        // 빈 줄
        if (line.trim() === '') {
          return <br key={i} />;
        }
        // 일반 텍스트
        return <p key={i} className="legal-p">{line}</p>;
      });
  };

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
