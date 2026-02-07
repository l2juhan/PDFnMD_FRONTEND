/**
 * GET /status/{task_id} API
 * 변환 작업 상태 조회
 */

import { api } from './index';
import type { StatusResponse } from '../types';

export async function getStatus(taskId: string): Promise<StatusResponse> {
  const response = await api.get<StatusResponse>(`/status/${taskId}`);
  return response.data;
}
