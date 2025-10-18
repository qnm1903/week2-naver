import React, { useEffect, useRef } from 'react';

type PlayerType = 'ODD' | 'EVEN';

interface PauseOverlayProps {
  pausedBy: PlayerType;
  timeRemaining: number;
  winnerIfTimeout: PlayerType;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({
  pausedBy,
  timeRemaining,
  winnerIfTimeout,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      const percentage = (timeRemaining / 60) * 100;
      progressBarRef.current.style.width = `${percentage}%`;
    }
  }, [timeRemaining]);

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-(--color-cosmic-void)/85 backdrop-blur-sm
        flex items-center justify-center
        animate-[pause-entrance_300ms_ease-out]
      "
    >
      <div
        className="
          bg-gradient-to-br from-(--color-cosmic-gray) to-[#0F1419]
          border-2 border-[rgb(251_191_36_/_0.4)]
          rounded-2xl p-12 max-w-md w-full mx-4
          shadow-[0_20px_60px_rgb(0_0_0_/_0.5)]
        "
      >
        {/* Pause Icon */}
        <div className="flex justify-center mb-6">
          <div className="text-6xl animate-[pause-pulse_2s_infinite]">⏸️</div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Game Paused
        </h2>

        {/* Disconnection Notice */}
        <p className="text-lg font-medium text-gray-400 text-center mb-4">
          <span className={pausedBy === 'ODD' ? 'text-gradient-odd' : 'text-gradient-even'}>
            {pausedBy}
          </span>{' '}
          player disconnected
        </p>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-2xl">⏱️</span>
          <span
            className="
              font-mono text-4xl font-extrabold
              bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]
              bg-clip-text text-transparent
            "
          >
            {timeRemaining} seconds
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-[rgb(251_191_36_/_0.2)] rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] transition-all duration-1000 ease-linear"
            />
          </div>
        </div>

        {/* Explanation */}
        <p className="text-base text-gray-500 text-center mb-2">
          Waiting for reconnection...
        </p>

        {/* Consequence */}
        <p className="text-sm font-medium text-red-500 text-center">
          If no return:{' '}
          <span className={winnerIfTimeout === 'ODD' ? 'text-gradient-odd' : 'text-gradient-even'}>
            {winnerIfTimeout}
          </span>{' '}
          wins by timeout
        </p>
      </div>
    </div>
  );
};

export default PauseOverlay;