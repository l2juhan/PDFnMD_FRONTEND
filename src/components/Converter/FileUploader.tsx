/**
 * FileUploader - 파일 업로드 컴포넌트
 * 파일 선택 버튼 + 드래그 앤 드롭 영역
 */

import { useRef, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { SelectedFile } from './SelectedFile';
import {
  type SelectedFileInfo,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from './types';

interface FileUploaderProps {
  selectedFile: SelectedFileInfo | null;
  onFileSelect: (file: SelectedFileInfo) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

export function FileUploader({
  selectedFile,
  onFileSelect,
  onFileRemove,
  disabled,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndSelectFile = useCallback(
    (file: File) => {
      // 확장자 검증
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('PDF 파일만 업로드 가능합니다');
        return;
      }

      // 크기 검증
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다`);
        return;
      }

      onFileSelect({
        file,
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
      });
    },
    [onFileSelect]
  );

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 숨겨진 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* 파일 선택 버튼 */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-7 py-2.5
                   bg-black text-white border-none rounded-sm
                   text-[15px] font-medium cursor-pointer
                   hover:opacity-85 transition-opacity
                   disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        <svg
          className="w-[18px] h-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        파일 선택
      </button>

      {/* 파일 힌트 */}
      <span className="text-[13px] text-gray-500 -mt-1">
        PDF · 최대 {MAX_FILE_SIZE_MB}MB
      </span>

      {/* 드롭존 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full border-[1.5px] border-dashed rounded-md
          py-7 px-6 text-center bg-white min-h-[80px]
          flex items-center justify-center
          transition-all duration-200
          ${
            isDragOver
              ? 'border-black bg-gray-100'
              : 'border-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {selectedFile ? (
          <SelectedFile
            file={selectedFile}
            onRemove={onFileRemove}
            disabled={disabled}
          />
        ) : (
          <span className="text-[13px] text-gray-500">
            또는 여기에 PDF를 드래그 앤 드롭
          </span>
        )}
      </div>
    </div>
  );
}
