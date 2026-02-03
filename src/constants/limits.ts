export const LIMITS = {
  MAX_FILES: 20,
  MAX_FILE_SIZE_MB: 20,
  MAX_TOTAL_SIZE_MB: 100,
  FILE_RETENTION_HOURS: 24,
} as const;

export const ACCEPTED_FORMATS = {
  'pdf-to-md': ['application/pdf', '.pdf'],
  'md-to-pdf': ['text/markdown', 'text/plain', '.md'],
} as const;

export const POLLING_CONFIG = {
  INTERVAL_MS: 2000,
  MAX_ATTEMPTS: 150,
} as const;

export const UPLOAD_CONFIG = {
  TIMEOUT_MS: 120000,
  CONCURRENT_UPLOADS: 3,
} as const;
