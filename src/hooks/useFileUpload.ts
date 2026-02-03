import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ConversionMode } from '../types';
import { LIMITS, ACCEPTED_FORMATS } from '../constants/limits';

interface UseFileUploadOptions {
  mode: ConversionMode;
  existingFileCount?: number;
}

interface ValidationResult {
  valid: File[];
  invalid: Array<{ file: File; reason: string }>;
}

interface ValidationError {
  filename: string;
  error: string;
}

interface UseFileUploadReturn {
  isDragging: boolean;
  validationErrors: ValidationError[];
  validateFiles: (files: FileList | File[]) => ValidationResult;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => File[];
  clearErrors: () => void;
}

export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const { t } = useTranslation();
  const { mode, existingFileCount = 0 } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validateFiles = useCallback(
    (files: FileList | File[]): ValidationResult => {
      const fileArray = Array.from(files);
      const valid: File[] = [];
      const invalid: Array<{ file: File; reason: string }> = [];

      const allowedCount = Math.max(0, LIMITS.MAX_FILES - existingFileCount);

      if (allowedCount === 0) {
        fileArray.forEach((file) => {
          invalid.push({
            file,
            reason: t('error.tooManyFiles', { count: LIMITS.MAX_FILES }),
          });
        });
        fileArray.length = 0;
      } else if (fileArray.length > allowedCount) {
        fileArray.slice(allowedCount).forEach((file) => {
          invalid.push({
            file,
            reason: t('error.tooManyFiles', { count: LIMITS.MAX_FILES }),
          });
        });
        fileArray.splice(allowedCount);
      }

      const acceptedTypes = ACCEPTED_FORMATS[mode];
      let totalSize = 0;

      for (const file of fileArray) {
        const isValidType = acceptedTypes.some((type) => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type);
          }
          return file.type === type;
        });

        if (!isValidType) {
          invalid.push({ file, reason: t('error.invalidFormat') });
          continue;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > LIMITS.MAX_FILE_SIZE_MB) {
          invalid.push({
            file,
            reason: t('error.fileTooLarge', { size: LIMITS.MAX_FILE_SIZE_MB }),
          });
          continue;
        }

        // 총 크기 체크를 먼저 수행 (파일 추가 전에 검사)
        if (totalSize + fileSizeMB > LIMITS.MAX_TOTAL_SIZE_MB) {
          invalid.push({
            file,
            reason: t('error.totalSizeTooLarge', { size: LIMITS.MAX_TOTAL_SIZE_MB }),
          });
          continue;
        }

        totalSize += fileSizeMB;
        valid.push(file);
      }

      setValidationErrors(
        invalid.map(({ file, reason }) => ({
          filename: file.name,
          error: reason,
        }))
      );

      return { valid, invalid };
    },
    [mode, existingFileCount, t]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent): File[] => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const { files } = e.dataTransfer;
      const { valid } = validateFiles(files);
      return valid;
    },
    [validateFiles]
  );

  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    isDragging,
    validationErrors,
    validateFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    clearErrors,
  };
}
