import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import i18n from '../i18n';
import { ApiErrorCode, ConversionMode, HTTP_STATUS_TO_ERROR_CODE } from '../types';
import type {
  ApiError,
  BatchDownloadRequest,
  ConvertResponse,
  HealthResponse,
  TaskStatusResponse,
} from '../types';
import { LIMITS, UPLOAD_CONFIG } from '../constants/limits';

// ===================================
// Configuration
// ===================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TIMEOUT_MS = 30000;

// ===================================
// Axios Instance
// ===================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===================================
// Request Interceptor
// ===================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    config.headers['Accept-Language'] = i18n.language;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===================================
// Response Interceptor
// ===================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    const apiError = transformToApiError(error);

    if (import.meta.env.DEV) {
      console.error(`[API Error]`, apiError);
    }

    return Promise.reject(apiError);
  }
);

// ===================================
// Error Transformer
// ===================================

function transformToApiError(error: AxiosError): ApiError {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        code: ApiErrorCode.TIMEOUT,
        message: i18n.t('error.timeout'),
        originalError: error,
      };
    }
    return {
      code: ApiErrorCode.NETWORK_ERROR,
      message: i18n.t('error.networkError'),
      originalError: error,
    };
  }

  const { status, data } = error.response;
  const serverMessage = (data as { detail?: string })?.detail || error.message;

  if (status === 400) {
    const errorCode = detectBadRequestType(serverMessage);
    const params = getErrorParams(errorCode);
    return {
      code: errorCode,
      message: getLocalizedErrorMessage(errorCode, params),
      statusCode: status,
      originalError: error,
    };
  }

  const errorCode = HTTP_STATUS_TO_ERROR_CODE[status] || ApiErrorCode.UNKNOWN;
  return {
    code: errorCode,
    message: getLocalizedErrorMessage(errorCode),
    statusCode: status,
    originalError: error,
  };
}

function detectBadRequestType(message: string): ApiErrorCode {
  const lowerMessage = message.toLowerCase();

  // TOO_MANY_FILES: 파일 개수 초과 관련 메시지
  if (/too many files|exceeds?\s*(the\s*)?(maximum\s*)?files?|maximum\s*files?\s*exceeded|file\s*count\s*exceeded|max(imum)?\s*\d+\s*files?/i.test(lowerMessage)) {
    return ApiErrorCode.TOO_MANY_FILES;
  }

  // FILE_TOO_LARGE: 파일 크기 초과 관련 메시지
  if (/file\s*(is\s*)?too\s*large|exceeds?\s*(the\s*)?(maximum\s*)?size|size\s*limit\s*exceeded|exceeded\s*\d+\s*mb|max(imum)?\s*size/i.test(lowerMessage)) {
    return ApiErrorCode.FILE_TOO_LARGE;
  }

  // INVALID_FILE_TYPE: 파일 타입 관련 메시지
  if (/invalid\s*file\s*type|unsupported\s*file\s*type|wrong\s*file\s*type|file\s*type\s*(is\s*)?(not\s*)?(allowed|supported|valid)/i.test(lowerMessage)) {
    return ApiErrorCode.INVALID_FILE_TYPE;
  }

  return ApiErrorCode.UNKNOWN;
}

function getErrorParams(code: ApiErrorCode): Record<string, unknown> | undefined {
  switch (code) {
    case ApiErrorCode.TOO_MANY_FILES:
      return { count: LIMITS.MAX_FILES };
    case ApiErrorCode.FILE_TOO_LARGE:
      return { size: LIMITS.MAX_FILE_SIZE_MB };
    default:
      return undefined;
  }
}

function getLocalizedErrorMessage(code: ApiErrorCode, params?: Record<string, unknown>): string {
  const messageMap: Record<ApiErrorCode, string> = {
    [ApiErrorCode.INVALID_FILE_TYPE]: 'error.invalidFormat',
    [ApiErrorCode.TOO_MANY_FILES]: 'error.tooManyFiles',
    [ApiErrorCode.FILE_TOO_LARGE]: 'error.fileTooLarge',
    [ApiErrorCode.TASK_NOT_FOUND]: 'error.taskNotFound',
    [ApiErrorCode.CONVERSION_FAILED]: 'error.conversionFailed',
    [ApiErrorCode.NETWORK_ERROR]: 'error.networkError',
    [ApiErrorCode.TIMEOUT]: 'error.timeout',
    [ApiErrorCode.UNKNOWN]: 'error.unknown',
  };

  return i18n.t(messageMap[code], params);
}

// ===================================
// API Functions
// ===================================

export async function convertFile(
  file: File,
  mode: ConversionMode,
  onUploadProgress?: (progress: number) => void
): Promise<ConvertResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode);

  const response = await apiClient.post<ConvertResponse>('/convert', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: UPLOAD_CONFIG.TIMEOUT_MS,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(progress);
      }
    },
  });

  return response.data;
}

export async function getStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await apiClient.get<TaskStatusResponse>(`/status/${taskId}`);
  return response.data;
}

export async function downloadFile(taskId: string): Promise<Blob> {
  const response = await apiClient.get(`/download/${taskId}`, {
    responseType: 'blob',
    timeout: UPLOAD_CONFIG.TIMEOUT_MS,
  });
  return response.data;
}

export async function downloadBatch(taskIds: string[]): Promise<Blob> {
  const request: BatchDownloadRequest = { task_ids: taskIds };
  const response = await apiClient.post('/download/batch', request, {
    responseType: 'blob',
    timeout: UPLOAD_CONFIG.TIMEOUT_MS,
  });
  return response.data;
}

export async function checkHealth(): Promise<HealthResponse> {
  // /api를 제거하고 /health 경로 구성
  // 절대 경로인지 상대 경로인지 확인
  const isAbsolute = /^https?:\/\//i.test(API_BASE_URL);
  let healthUrl: string;

  if (isAbsolute) {
    const url = new URL(API_BASE_URL);
    url.pathname = '/health';
    healthUrl = url.toString();
  } else {
    // 상대 경로인 경우 현재 origin 사용
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    healthUrl = `${origin}/health`;
  }

  const response = await apiClient.get<HealthResponse>(healthUrl, {
    baseURL: '', // apiClient baseURL 무시
    timeout: 5000,
  });
  return response.data;
}

// ===================================
// Exports
// ===================================

export { apiClient };

export default {
  convertFile,
  getStatus,
  downloadFile,
  downloadBatch,
  checkHealth,
};
