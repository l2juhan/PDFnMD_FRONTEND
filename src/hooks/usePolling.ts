/**
 * usePolling - 폴링 유틸리티 훅
 * 일정 간격으로 콜백을 실행하고 조건 충족 시 중단
 */

import { useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval: number;
  maxCount: number;
  onMaxReached?: () => void;
}

interface UsePollingReturn {
  start: (callback: () => Promise<boolean>) => void;
  stop: () => void;
  isPolling: boolean;
}

export function usePolling(options: UsePollingOptions): UsePollingReturn {
  const { interval, maxCount, onMaxReached } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);
  const isPollingRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isPollingRef.current = false;
    countRef.current = 0;
  }, []);

  const start = useCallback(
    (callback: () => Promise<boolean>) => {
      stop();
      isPollingRef.current = true;
      countRef.current = 0;

      const poll = async () => {
        if (!isPollingRef.current) return;

        countRef.current += 1;

        if (countRef.current > maxCount) {
          stop();
          onMaxReached?.();
          return;
        }

        try {
          const shouldStop = await callback();
          if (shouldStop) {
            stop();
            return;
          }
        } catch {
          // 에러 발생해도 폴링 계속
        }

        if (isPollingRef.current) {
          timerRef.current = setTimeout(poll, interval);
        }
      };

      // 첫 번째 폴링 즉시 실행
      poll();
    },
    [interval, maxCount, onMaxReached, stop]
  );

  return {
    start,
    stop,
    isPolling: isPollingRef.current,
  };
}
