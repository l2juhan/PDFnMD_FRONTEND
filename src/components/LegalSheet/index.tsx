/**
 * LegalSheet - 개인정보처리방침/이용약관 슬라이드업 시트
 * React Island (client:load)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// 마크다운 콘텐츠
const PRIVACY_POLICY = `# 개인정보처리방침

**시행일: 2026년 2월 1일**

PDFnMD(이하 "서비스")는 이용자의 개인정보를 중요시하며, 개인정보보호법을 준수합니다.

## 제1조 (수집하는 개인정보)

서비스는 회원가입 없이 이용 가능하며, **개인정보를 수집하지 않습니다.**

## 제2조 (파일 처리)

1. **업로드된 PDF 파일**: 24시간 후 서버에서 자동 삭제됩니다.
2. **추출된 이미지**: Cloudflare R2에 영구 저장됩니다.
3. **변환된 마크다운**: 서버에 저장되지 않으며, 클라이언트에서만 처리됩니다.

## 제3조 (쿠키 및 분석)

서비스는 현재 쿠키나 분석 도구를 사용하지 않습니다.

## 제4조 (제3자 제공)

수집하는 개인정보가 없으므로 제3자에게 제공하는 정보도 없습니다.

## 제5조 (문의)

개인정보 관련 문의: GitHub Issues를 통해 연락해 주세요.

---

*본 방침은 서비스 개선에 따라 변경될 수 있으며, 변경 시 공지합니다.*`;

const TERMS_OF_SERVICE = `# 이용약관

**시행일: 2026년 2월 1일**

본 약관은 PDFnMD(이하 "서비스") 이용에 관한 조건을 규정합니다.

## 제1조 (목적)

본 약관은 서비스 이용에 관한 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

## 제2조 (서비스 내용)

1. PDF 파일을 마크다운 형식으로 변환
2. PDF 내 이미지 추출 및 영구 호스팅
3. Notion 붙여넣기에 최적화된 GFM 형식 출력

## 제3조 (이용 조건)

1. **파일 크기**: 최대 20MB
2. **파일 형식**: PDF만 지원
3. **이미지 보관**: 클라우드에 영구 저장

## 제4조 (금지 행위)

다음 행위는 금지됩니다:
- 불법 콘텐츠가 포함된 PDF 업로드
- 서비스에 대한 악의적 공격 (DoS 등)
- 자동화된 대량 요청

## 제5조 (면책 조항)

1. 서비스는 "있는 그대로" 제공되며, 특정 목적에의 적합성을 보장하지 않습니다.
2. 변환 결과의 정확성을 100% 보장하지 않습니다.
3. 서비스 이용으로 인한 손해에 대해 책임지지 않습니다.

## 제6조 (서비스 변경 및 중단)

서비스는 사전 통지 없이 변경되거나 중단될 수 있습니다.

## 제7조 (약관 변경)

약관 변경 시 서비스 내 공지하며, 변경 후 계속 이용 시 동의한 것으로 간주합니다.

---

*문의: GitHub Issues*`;

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
