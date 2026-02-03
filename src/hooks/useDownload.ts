import { useState, useCallback } from 'react';
import { downloadFile, downloadBatch } from '../services/api';
import type { ApiError } from '../types';

interface UseDownloadReturn {
  isDownloading: boolean;
  downloadProgress: number;
  error: ApiError | null;
  downloadSingle: (taskId: string, filename: string) => Promise<void>;
  downloadMultiple: (taskIds: string[], filename?: string) => Promise<void>;
  clearError: () => void;
}

export function useDownload(): UseDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);

  const triggerDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 다운로드가 시작될 시간을 주기 위해 revoke를 지연
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const downloadSingle = useCallback(
    async (taskId: string, filename: string) => {
      setIsDownloading(true);
      setError(null);
      setDownloadProgress(0);

      try {
        const blob = await downloadFile(taskId);
        triggerDownload(blob, filename);
        setDownloadProgress(100);
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setIsDownloading(false);
      }
    },
    [triggerDownload]
  );

  const downloadMultiple = useCallback(
    async (taskIds: string[], filename = 'pdfnmd-converted.zip') => {
      setIsDownloading(true);
      setError(null);
      setDownloadProgress(0);

      try {
        const blob = await downloadBatch(taskIds);
        triggerDownload(blob, filename);
        setDownloadProgress(100);
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setIsDownloading(false);
      }
    },
    [triggerDownload]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDownloading,
    downloadProgress,
    error,
    downloadSingle,
    downloadMultiple,
    clearError,
  };
}
