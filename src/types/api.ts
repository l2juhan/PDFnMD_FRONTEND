/**
 * API 요청/응답 타입 정의
 * 백엔드 app/models/response.py 기반
 */

// 변환 모드
export type ConversionMode = 'pdf-to-md';

// 작업 상태
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// POST /convert 요청
export interface ConvertRequest {
  file: File;
  mode: ConversionMode;
}

// POST /convert 응답
export interface ConvertResponse {
  task_id: string;
  mode: ConversionMode;
  status: TaskStatus;
  message: string;
}

// GET /status/{task_id} 응답
export interface StatusResponse {
  task_id: string;
  mode: ConversionMode;
  status: TaskStatus;
  progress: number;
  error: string | null;
  filename: string | null;
}

// GET /content/{task_id} 응답
export interface ContentResponse {
  task_id: string;
  content: string;
  format: string;
  original_filename: string;
  size_bytes: number;
  size_kb: number;
}

// API 에러 응답
export interface ApiError {
  detail: string;
  status_code?: number;
}
