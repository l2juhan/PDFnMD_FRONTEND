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
  // 상태별 배경색
  const getBackgroundColor = () => {
    switch (state) {
      case 'idle':
        return disabled ? '#ccc' : '#191919';
      case 'converting':
        return '#444';
      case 'completed':
      case 'copied':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      default:
        return '#191919';
    }
  };

  // 상태별 커서
  const getCursor = () => {
    if (disabled || state === 'converting') return 'not-allowed';
    if (state === 'converting') return 'wait';
    return 'pointer';
  };

  // 상태별 텍스트
  const getButtonContent = () => {
    switch (state) {
      case 'idle':
        return '마크다운으로 변환';
      case 'converting':
        return (
          <>
            <Spinner />
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

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    marginTop: '16px',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: getBackgroundColor(),
    color: disabled && state === 'idle' ? '#888' : '#fff',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: getCursor(),
    transition: 'all 0.15s',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.opacity = '0.85';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {/* 프로그레스 fill */}
      {state === 'converting' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            transition: 'width 0.3s ease-out',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 버튼 내용 */}
      <span
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {getButtonContent()}
      </span>
    </button>
  );
}

// 스피너 컴포넌트
function Spinner() {
  return (
    <div
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}
