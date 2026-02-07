/**
 * Axios 인스턴스 설정
 * 에러 인터셉터 + Toast 알림
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import i18n from '../i18n';
import type { ApiError } from '../types';

// 환경 변수에서 API URL 가져오기 (Astro public env)
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api';

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // FormData 요청 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 핸들링
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    let message: string;

    if (error.response?.data?.detail) {
      // 서버에서 온 메시지는 그대로 사용
      message = error.response.data.detail;
    } else if (error.message === 'Network Error') {
      message = i18n.t('toast.networkError');
    } else if (error.code === 'ECONNABORTED') {
      message = i18n.t('toast.timeout');
    } else if (error.response?.status === 413) {
      message = i18n.t('toast.fileTooLarge');
    } else if (error.response?.status === 415) {
      message = i18n.t('toast.unsupportedFormat');
    } else if (error.response?.status === 500) {
      message = i18n.t('toast.serverError');
    } else {
      message = i18n.t('toast.unknownError');
    }

    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
