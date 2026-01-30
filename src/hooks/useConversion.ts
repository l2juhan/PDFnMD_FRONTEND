import { useState, useCallback } from 'react';
import { convertFile } from '../services/api';
import { ConversionMode, TaskStatus } from '../types';
import type { UploadedFile, ApiError } from '../types';
import { usePolling } from './usePolling';
import { useDownload } from './useDownload';
import { UPLOAD_CONFIG } from '../constants/limits';

interface UseConversionReturn {
  files: UploadedFile[];
  mode: ConversionMode;
  isConverting: boolean;
  setMode: (mode: ConversionMode) => void;
  uploadAndConvert: (files: File[]) => Promise<void>;
  downloadSingleFile: (file: UploadedFile) => Promise<void>;
  downloadAllFiles: () => Promise<void>;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  retryFile: (fileId: string) => Promise<void>;
}

export function useConversion(): UseConversionReturn {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mode, setMode] = useState<ConversionMode>(ConversionMode.PDF_TO_MD);
  const [isConverting, setIsConverting] = useState(false);

  const { downloadSingle, downloadMultiple } = useDownload();

  const updateFile = useCallback((fileId: string, updates: Partial<UploadedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f)));
  }, []);

  usePolling(files, updateFile);

  const uploadSingleFile = useCallback(
    async (uploadedFile: UploadedFile) => {
      try {
        updateFile(uploadedFile.id, { status: 'uploading', progress: 0 });

        const response = await convertFile(uploadedFile.file, mode, (progress) =>
          updateFile(uploadedFile.id, { progress })
        );

        updateFile(uploadedFile.id, {
          taskId: response.task_id,
          status: TaskStatus.PENDING,
          progress: 0,
        });

        return response.task_id;
      } catch (error) {
        const apiError = error as ApiError;
        updateFile(uploadedFile.id, {
          status: TaskStatus.FAILED,
          error: apiError.message,
        });
        throw error;
      }
    },
    [mode, updateFile]
  );

  const uploadAndConvert = useCallback(
    async (newFiles: File[]) => {
      setIsConverting(true);

      const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'idle' as const,
        progress: 0,
        filename: file.name,
      }));

      setFiles((prev) => [...prev, ...uploadedFiles]);

      const concurrency = UPLOAD_CONFIG.CONCURRENT_UPLOADS;
      for (let i = 0; i < uploadedFiles.length; i += concurrency) {
        const batch = uploadedFiles.slice(i, i + concurrency);
        await Promise.allSettled(batch.map(uploadSingleFile));
      }

      setIsConverting(false);
    },
    [uploadSingleFile]
  );

  const getConvertedFilename = useCallback(
    (originalFilename: string): string => {
      const extension = mode === ConversionMode.PDF_TO_MD ? '.md' : '.pdf';
      return originalFilename.replace(/\.(pdf|md)$/i, extension);
    },
    [mode]
  );

  const downloadSingleFile = useCallback(
    async (file: UploadedFile) => {
      if (!file.taskId) return;
      const filename = getConvertedFilename(file.filename);
      await downloadSingle(file.taskId, filename);
    },
    [downloadSingle, getConvertedFilename]
  );

  const downloadAllFiles = useCallback(async () => {
    const completedFiles = files.filter(
      (f) => f.status === TaskStatus.COMPLETED && f.taskId
    );
    if (completedFiles.length === 0) return;

    if (completedFiles.length === 1) {
      await downloadSingleFile(completedFiles[0]);
      return;
    }

    const taskIds = completedFiles.map((f) => f.taskId!);
    await downloadMultiple(taskIds);
  }, [files, downloadSingleFile, downloadMultiple]);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const retryFile = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      updateFile(fileId, { status: 'idle', progress: 0, error: undefined });
      await uploadSingleFile(file);
    },
    [files, uploadSingleFile, updateFile]
  );

  return {
    files,
    mode,
    isConverting,
    setMode,
    uploadAndConvert,
    downloadSingleFile,
    downloadAllFiles,
    removeFile,
    clearFiles,
    retryFile,
  };
}
