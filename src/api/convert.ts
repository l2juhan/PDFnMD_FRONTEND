/**
 * POST /convert API
 * PDF 파일 변환 요청
 */

import { api } from './index';
import type { ConvertRequest, ConvertResponse, ConversionMode } from '../types';

export async function convertFile(request: ConvertRequest): Promise<ConvertResponse> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('mode', request.mode);

  const response = await api.post<ConvertResponse>('/convert', formData);
  return response.data;
}

// 편의 함수: PDF to Markdown
export async function convertPdfToMarkdown(file: File): Promise<ConvertResponse> {
  return convertFile({
    file,
    mode: 'pdf-to-md' as ConversionMode,
  });
}
