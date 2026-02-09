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

// 상태별 설정 객체 (OCP: 새 상태 추가 시 여기만 수정)
interface StateConfig {
  className: string;
  icon?: string;
  showSpinner?: boolean;
  label: string | ((progress: number) => string);
}

const STATE_CONFIG: Record<ButtonState, StateConfig> = {
  idle: {
    className: '',
    label: '마크다운으로 변환',
  },
  converting: {
    className: 'state-converting',
    showSpinner: true,
    label: (progress) => `변환 중… ${Math.round(progress)}%`,
  },
  completed: {
    className: 'state-completed',
    icon: '📋',
    label: '클립보드에 복사',
  },
  copied: {
    className: 'state-copied',
    icon: '✓',
    label: '복사 완료',
  },
  failed: {
    className: 'state-failed',
    label: '변환 실패 — 다시 시도',
  },
};

export function ActionButton({
  state,
  progress,
  disabled,
  onClick,
}: ActionButtonProps) {
  const config = STATE_CONFIG[state];
  const label = typeof config.label === 'function'
    ? config.label(progress)
    : config.label;

  const isDisabled = disabled || state === 'converting';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`action-btn ${config.className}`}
    >
      {/* 프로그레스 fill */}
      <div
        className="btn-fill"
        style={{ width: state === 'converting' ? `${progress}%` : '0%' }}
      />

      {/* 버튼 내용 */}
      <span className="btn-label">
        {config.showSpinner && <div className="spinner" />}
        {config.icon && <span>{config.icon}</span>}
        {label}
      </span>
    </button>
  );
}
