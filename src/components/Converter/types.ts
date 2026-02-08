/**
 * Converter 컴포넌트 타입 정의
 */

// 버튼 상태
export type ButtonState =
  | 'idle'
  | 'converting'
  | 'completed'
  | 'copied'
  | 'failed';

// 파일 정보
export interface SelectedFileInfo {
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
}

// 변환 상태
export interface ConversionState {
  buttonState: ButtonState;
  progress: number;
  taskId: string | null;
  content: string | null;
  error: string | null;
}

// 파일 크기 포맷
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 상수
export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const POLLING_INTERVAL_MS = 2000;
export const MAX_POLLING_COUNT = 150; // 5분
