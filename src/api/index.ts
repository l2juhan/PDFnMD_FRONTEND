/**
 * Axios 인스턴스 설정
 * 에러 인터셉터 + Toast 알림
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
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
    // 에러 메시지 추출
    let message = '알 수 없는 오류가 발생했습니다';

    if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message === 'Network Error') {
      message = '서버에 연결할 수 없습니다';
    } else if (error.code === 'ECONNABORTED') {
      message = '요청 시간이 초과되었습니다';
    } else if (error.response?.status === 413) {
      message = '파일 크기가 너무 큽니다';
    } else if (error.response?.status === 415) {
      message = '지원하지 않는 파일 형식입니다';
    } else if (error.response?.status === 500) {
      message = '서버 오류가 발생했습니다';
    }

    // 토스트 알림 표시
    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;
