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
    <div className="flex items-center gap-3 w-full">
      {/* PDF 아이콘 박스 */}
      <div
        className="w-10 h-10 bg-gray-100 border border-gray-300 rounded-md
                   flex items-center justify-center shrink-0"
      >
        <span className="text-[11px] font-semibold text-error uppercase">
          PDF
        </span>
      </div>

      {/* 파일 정보 */}
      <div className="flex-1 min-w-0 text-left">
        <div
          className="text-sm font-medium text-gray-900
                     whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {file.name}
        </div>
        <div className="text-xs text-gray-500">{file.sizeFormatted}</div>
      </div>

      {/* 제거 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="shrink-0 bg-transparent border-none text-gray-500
                   cursor-pointer text-lg px-2 py-1 transition-colors
                   hover:text-error disabled:opacity-50 disabled:cursor-not-allowed"
        title="제거"
        aria-label="파일 제거"
      >
        ×
      </button>
    </div>
  );
}
