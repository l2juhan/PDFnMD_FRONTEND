import { useEffect, useRef, useCallback } from 'react';
import { getStatus } from '../services/api';
import { TaskStatus } from '../types';
import type { UploadedFile, ApiError, TaskStatusResponse } from '../types';
import { POLLING_CONFIG } from '../constants/limits';

interface UsePollingOptions {
  interval?: number;
  maxAttempts?: number;
  onStatusChange?: (fileId: string, status: TaskStatusResponse) => void;
  onError?: (fileId: string, error: ApiError) => void;
}

export function usePolling(
  files: UploadedFile[],
  updateFile: (fileId: string, updates: Partial<UploadedFile>) => void,
  options: UsePollingOptions = {}
) {
  const {
    interval = POLLING_CONFIG.INTERVAL_MS,
    maxAttempts = POLLING_CONFIG.MAX_ATTEMPTS,
    onStatusChange,
    onError,
  } = options;

  const attemptsRef = useRef<Record<string, number>>({});
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const pollFile = useCallback(
    async (file: UploadedFile) => {
      if (!file.taskId) return;

      const fileId = file.id;
      attemptsRef.current[fileId] = (attemptsRef.current[fileId] || 0) + 1;

      if (attemptsRef.current[fileId] > maxAttempts) {
        clearInterval(intervalsRef.current[fileId]);
        delete intervalsRef.current[fileId];
        updateFile(fileId, {
          status: TaskStatus.FAILED,
          error: 'Polling timeout',
        });
        return;
      }

      try {
        const status = await getStatus(file.taskId);

        updateFile(fileId, {
          status: status.status,
          progress: status.progress,
          downloadUrl: status.download_url || undefined,
          error: status.error || undefined,
        });

        onStatusChange?.(fileId, status);

        if (status.status === TaskStatus.COMPLETED || status.status === TaskStatus.FAILED) {
          clearInterval(intervalsRef.current[fileId]);
          delete intervalsRef.current[fileId];
          delete attemptsRef.current[fileId];
        }
      } catch (error) {
        onError?.(fileId, error as ApiError);
      }
    },
    [maxAttempts, updateFile, onStatusChange, onError]
  );

  useEffect(() => {
    const pendingOrProcessing = files.filter(
      (f) =>
        f.taskId && (f.status === TaskStatus.PENDING || f.status === TaskStatus.PROCESSING)
    );

    pendingOrProcessing.forEach((file) => {
      if (!intervalsRef.current[file.id]) {
        pollFile(file);

        intervalsRef.current[file.id] = setInterval(() => {
          const currentFile = files.find((f) => f.id === file.id);
          if (currentFile) {
            pollFile(currentFile);
          }
        }, interval);
      }
    });

    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, [files, interval, pollFile]);

  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
      attemptsRef.current = {};
    };
  }, []);
}
