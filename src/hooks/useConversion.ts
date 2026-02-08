/**
 * useConversion - 변환 로직 커스텀 훅
 * 상태 머신 기반 변환 프로세스 관리
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { convertPdfToMarkdown, getStatus, getContent } from '../api/exports';
import { usePolling } from './usePolling';
import {
  type ButtonState,
  type ConversionState,
  POLLING_INTERVAL_MS,
  MAX_POLLING_COUNT,
} from '../components/Converter/types';

const initialState: ConversionState = {
  buttonState: 'idle',
  progress: 0,
  taskId: null,
  content: null,
  error: null,
};

export function useConversion() {
  const [state, setState] = useState<ConversionState>(initialState);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setButtonState = useCallback((buttonState: ButtonState) => {
    setState((prev) => ({ ...prev, buttonState }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const polling = usePolling({
    interval: POLLING_INTERVAL_MS,
    maxCount: MAX_POLLING_COUNT,
    onMaxReached: () => {
      setState((prev) => ({
        ...prev,
        buttonState: 'failed',
        error: '변환 시간이 초과되었습니다',
      }));
      toast.error('변환 시간이 초과되었습니다');
    },
  });

  const reset = useCallback(() => {
    polling.stop();
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
    setState(initialState);
  }, [polling.stop]);

  const startConversion = useCallback(
    async (file: File) => {
      // 상태 초기화
      setState({
        buttonState: 'converting',
        progress: 0,
        taskId: null,
        content: null,
        error: null,
      });

      try {
        // 1. 변환 요청
        const response = await convertPdfToMarkdown(file);
        const { task_id } = response;

        setState((prev) => ({ ...prev, taskId: task_id }));

        // 2. 폴링 시작
        polling.start(async () => {
          let status;
          try {
            status = await getStatus(task_id);
          } catch {
            // 상태 조회 실패 시 (404 등) failed로 전환하고 폴링 중단
            setState((prev) => ({
              ...prev,
              buttonState: 'failed',
              error: '변환 상태 조회에 실패했습니다',
            }));
            return true; // 폴링 중단
          }

          // 진행률 업데이트
          setProgress(status.progress);

          if (status.status === 'completed') {
            // 3. 콘텐츠 조회 (별도 에러 처리)
            try {
              const contentResponse = await getContent(task_id);
              setState((prev) => ({
                ...prev,
                buttonState: 'completed',
                progress: 100,
                content: contentResponse.content,
              }));
              toast.success('변환 완료 — 복사 버튼을 눌러주세요');
            } catch {
              setState((prev) => ({
                ...prev,
                buttonState: 'failed',
                error: '결과를 가져오는데 실패했습니다',
              }));
              toast.error('결과를 가져오는데 실패했습니다');
            }
            return true; // 폴링 중단 (성공/실패 무관)
          }

          if (status.status === 'failed') {
            setState((prev) => ({
              ...prev,
              buttonState: 'failed',
              error: status.error || '변환에 실패했습니다',
            }));
            toast.error(status.error || '변환에 실패했습니다');
            return true; // 폴링 중단
          }

          return false; // 계속 폴링
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          buttonState: 'failed',
          error: '변환 요청에 실패했습니다',
        }));
        // toast는 axios interceptor에서 처리
      }
    },
    [polling.start, setProgress]
  );

  const copyToClipboard = useCallback(async () => {
    if (!state.content) return;

    try {
      await navigator.clipboard.writeText(state.content);
      setButtonState('copied');
      toast.success('클립보드에 복사됨');

      // 이전 타이머 정리 (빠른 클릭 시 중복 방지)
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      // 1.5초 후 completed로 복귀
      copiedTimeoutRef.current = setTimeout(() => {
        setState((prev) => {
          if (prev.buttonState === 'copied') {
            return { ...prev, buttonState: 'completed' };
          }
          return prev;
        });
      }, 1500);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  }, [state.content, setButtonState]);

  const retry = useCallback(
    (file: File) => {
      startConversion(file);
    },
    [startConversion]
  );

  return {
    state,
    startConversion,
    copyToClipboard,
    retry,
    reset,
  };
}
