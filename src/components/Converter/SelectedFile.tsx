/**
 * SelectedFile - 선택된 파일 표시 컴포넌트
 * PDF 아이콘, 파일명, 크기, 제거 버튼
 */

import type { SelectedFileInfo } from './types';

interface SelectedFileProps {
  file: SelectedFileInfo;
  onRemove: () => void;
  disabled?: boolean;
}

export function SelectedFile({ file, onRemove, disabled }: SelectedFileProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* PDF 아이콘 박스 */}
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #e3e2de',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#ef4444',
            textTransform: 'uppercase',
          }}
        >
          PDF
        </span>
      </div>

      {/* 파일 정보 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#191919',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {file.name}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#888',
          }}
        >
          {file.sizeFormatted}
        </div>
      </div>

      {/* 제거 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        style={{
          flexShrink: 0,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#888',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          padding: '4px 8px',
          transition: 'color 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.color = '#ef4444';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#888';
        }}
        title="제거"
        aria-label="파일 제거"
      >
        ×
      </button>
    </div>
  );
}
