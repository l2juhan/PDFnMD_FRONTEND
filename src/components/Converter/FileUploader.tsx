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

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 28px',
    backgroundColor: disabled ? '#ccc' : '#191919',
    color: disabled ? '#888' : '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s',
  };

  const dropzoneStyle: React.CSSProperties = {
    width: '100%',
    border: `1.5px dashed ${isDragOver ? '#191919' : '#e3e2de'}`,
    borderRadius: '6px',
    padding: '28px 24px',
    textAlign: 'center',
    backgroundColor: isDragOver ? '#f5f5f5' : '#fff',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* 숨겨진 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* 파일 선택 버튼 */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '0.85';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        <svg
          style={{ width: '18px', height: '18px' }}
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
      <span
        style={{
          fontSize: '13px',
          color: '#888',
          marginTop: '-4px',
        }}
      >
        PDF · 최대 {MAX_FILE_SIZE_MB}MB
      </span>

      {/* 드롭존 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={dropzoneStyle}
      >
        {selectedFile ? (
          <SelectedFile
            file={selectedFile}
            onRemove={onFileRemove}
            disabled={disabled}
          />
        ) : (
          <span style={{ fontSize: '13px', color: '#888' }}>
            또는 여기에 PDF를 드래그 앤 드롭
          </span>
        )}
      </div>
    </div>
  );
}
