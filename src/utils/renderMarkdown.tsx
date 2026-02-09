/**
 * 간단한 마크다운 렌더러
 * 법적 문서용 마크다운을 React 컴포넌트로 변환
 */

import React from 'react';

/**
 * 인라인 볼드(**text**) 처리
 */
function renderInline(text: string): React.ReactNode {
  if (!text.includes('**')) return text;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )}
    </>
  );
}

/**
 * 마크다운 텍스트를 React 엘리먼트로 변환
 * 지원: h1, h2, ul, ol, bold, italic, hr
 */
export function renderMarkdown(md: string): React.ReactNode[] {
  return md.split('\n').map((line, i) => {
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
}
