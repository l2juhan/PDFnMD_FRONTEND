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
  // 상태별 스타일
  const getButtonClasses = () => {
    const base = `
      relative overflow-hidden flex items-center justify-center gap-2
      w-full mt-4 py-3 px-6 border-none rounded-sm
      text-[15px] font-medium font-sans transition-all duration-150
    `;

    switch (state) {
      case 'idle':
        return disabled
          ? `${base} bg-gray-300 text-gray-500 cursor-not-allowed`
          : `${base} bg-black text-white cursor-pointer hover:opacity-85`;
      case 'converting':
        return `${base} bg-gray-700 text-white cursor-wait`;
      case 'completed':
      case 'copied':
        return `${base} bg-success text-white cursor-pointer hover:opacity-85`;
      case 'failed':
        return `${base} bg-error text-white cursor-pointer hover:opacity-85`;
      default:
        return base;
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={getButtonClasses()}
    >
      {/* 프로그레스 fill */}
      {state === 'converting' && (
        <div
          className="absolute top-0 left-0 h-full bg-white/[0.18]
                     transition-[width] duration-300 ease-out pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* 버튼 내용 */}
      <span className="relative z-10 flex items-center gap-2">
        {getButtonContent()}
      </span>
    </button>
  );
}

// 스피너 컴포넌트
function Spinner() {
  return (
    <div
      className="w-4 h-4 border-2 border-white/30 border-t-white
                 rounded-full animate-spin"
    />
  );
}
