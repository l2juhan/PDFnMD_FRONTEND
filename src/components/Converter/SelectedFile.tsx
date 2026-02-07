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
    <div className="selected-file visible">
      {/* PDF 아이콘 박스 */}
      <div className="file-icon-box">
        <span>PDF</span>
      </div>

      {/* 파일 정보 */}
      <div className="file-meta">
        <div className="file-meta-name">{file.name}</div>
        <div className="file-meta-size">{file.sizeFormatted}</div>
      </div>

      {/* 제거 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="file-remove"
        title="제거"
        aria-label="파일 제거"
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        ×
      </button>
    </div>
  );
}
