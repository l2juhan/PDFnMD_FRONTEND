// ===================================
// API Error Codes
// ===================================

export const ApiErrorCode = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  TOO_MANY_FILES: 'TOO_MANY_FILES',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

// ===================================
// API Error Interface
// ===================================

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

// ===================================
// HTTP Status to Error Code Mapping
// ===================================

export const HTTP_STATUS_TO_ERROR_CODE: Record<number, ApiErrorCode> = {
  400: ApiErrorCode.INVALID_FILE_TYPE,
  404: ApiErrorCode.TASK_NOT_FOUND,
  413: ApiErrorCode.FILE_TOO_LARGE,
  500: ApiErrorCode.CONVERSION_FAILED,
};
