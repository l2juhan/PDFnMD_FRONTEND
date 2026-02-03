// ===================================
// Enums (as const for type safety)
// ===================================

export const ConversionMode = {
  PDF_TO_MD: 'pdf-to-md',
} as const;

export type ConversionMode = (typeof ConversionMode)[keyof typeof ConversionMode];

export const TaskStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// ===================================
// API Request Types
// ===================================

export interface ConvertRequest {
  file: File;
  mode: ConversionMode;
}

export interface BatchDownloadRequest {
  task_ids: string[];
}

// ===================================
// API Response Types
// ===================================

export interface ConvertResponse {
  task_id: string;
  mode: ConversionMode;
  status: TaskStatus;
  message: string;
}

export interface TaskStatusResponse {
  task_id: string;
  mode: ConversionMode;
  status: TaskStatus;
  progress: number;
  download_url: string | null;
  error: string | null;
  filename: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  version?: string;
  timestamp?: string;
}

// ===================================
// File Info (Frontend State)
// ===================================

export type FileStatus = TaskStatus | 'idle' | 'uploading';

export interface UploadedFile {
  id: string;
  file: File;
  taskId?: string;
  status: FileStatus;
  progress: number;
  downloadUrl?: string;
  error?: string;
  filename: string;
}
