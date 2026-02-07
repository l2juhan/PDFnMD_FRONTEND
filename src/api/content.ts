/**
 * GET /content/{task_id} API
 * 변환된 마크다운 콘텐츠 조회
 */

import { api } from './index';
import type { ContentResponse } from '../types';

export async function getContent(taskId: string): Promise<ContentResponse> {
  const response = await api.get<ContentResponse>(`/content/${taskId}`);
  return response.data;
}
