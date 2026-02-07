/**
 * ActionButton - 상태별 액션 버튼
 * idle/converting/completed/copied/failed 상태에 따라 UI 변경
 * 프로그레스 fill 애니메이션 포함
 */

import type { ButtonState } from './types';

interface ActionButtonProps {
  state: ButtonState;
  progress: number;
  disabled: boolean;
  onClick: () => void;
}

export function ActionButton({
  state,
  progress,
  disabled,
  onClick,
}: ActionButtonProps) {
  // 상태별 클래스
  const getStateClass = () => {
    switch (state) {
      case 'converting':
        return 'state-converting';
      case 'completed':
        return 'state-completed';
      case 'copied':
        return 'state-copied';
      case 'failed':
        return 'state-failed';
      default:
        return '';
    }
  };

  // 상태별 텍스트
  const getButtonContent = () => {
    switch (state) {
      case 'idle':
        return '마크다운으로 변환';
      case 'converting':
        return (
          <>
            <div className="spinner" />
            변환 중… {Math.round(progress)}%
          </>
        );
      case 'completed':
        return (
          <>
            <span>📋</span>
            클립보드에 복사
          </>
        );
      case 'copied':
        return (
          <>
            <span>✓</span>
            복사 완료
          </>
        );
      case 'failed':
        return '변환 실패 — 다시 시도';
      default:
        return '마크다운으로 변환';
    }
  };

  const isDisabled =
    disabled || state === 'converting' || (state === 'idle' && disabled);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`action-btn ${getStateClass()}`}
    >
      {/* 프로그레스 fill */}
      <div
        className="btn-fill"
        style={{ width: state === 'converting' ? `${progress}%` : '0%' }}
      />

      {/* 버튼 내용 */}
      <span className="btn-label">{getButtonContent()}</span>
    </button>
  );
}
