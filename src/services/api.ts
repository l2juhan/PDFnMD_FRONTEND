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
import { UPLOAD_CONFIG } from '../constants/limits';

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
    return {
      code: errorCode,
      message: getLocalizedErrorMessage(errorCode),
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

  if (lowerMessage.includes('file type') || lowerMessage.includes('invalid')) {
    return ApiErrorCode.INVALID_FILE_TYPE;
  }
  if (lowerMessage.includes('too many') || lowerMessage.includes('files')) {
    return ApiErrorCode.TOO_MANY_FILES;
  }
  if (lowerMessage.includes('large') || lowerMessage.includes('size')) {
    return ApiErrorCode.FILE_TOO_LARGE;
  }

  return ApiErrorCode.UNKNOWN;
}

function getLocalizedErrorMessage(code: ApiErrorCode): string {
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

  return i18n.t(messageMap[code]);
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
  const response = await axios.get<HealthResponse>(
    API_BASE_URL.replace('/api', '') + '/health',
    { timeout: 5000 }
  );
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
