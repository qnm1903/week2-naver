import React from 'react';
import { Card } from './ui/Card';

type PlayerType = 'ODD' | 'EVEN';

interface PlayerInfoCardProps {
  player: PlayerType;
  isYou: boolean;
  isActive: boolean;
  isPaused?: boolean;
  pauseTimeRemaining?: number;
}

const PlayerInfoCard: React.FC<PlayerInfoCardProps> = ({
  player,
  isYou,
  isActive,
  isPaused = false,
  pauseTimeRemaining = 0,
}) => {
  const numbers = player === 'ODD' ? [1, 3, 5, 7, 9] : [2, 4, 6, 8, 10];
  const gradientClass = player === 'ODD' ? 'gradient-odd' : 'gradient-even';

  return (
    <Card
      className={`
        relative transition-all duration-300
        ${isActive ? 'scale-103 shadow-[0_0_32px_rgba(59,130,246,0.4)] border-blue-500/50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${gradientClass}`} />
          <h3 className="text-lg font-semibold text-white">
            {player} PLAYER
          </h3>
        </div>
        {isYou && (
          <span
            className={`
              ${gradientClass}
              px-3 py-1 rounded-md text-xs font-semibold uppercase
              tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.3)]
            `}
          >
            YOU
          </span>
        )}
      </div>

      {/* Number Examples */}
      <div className="mb-3">
        <p className="text-sm text-gray-400 mb-2">Playing with:</p>
        <div className="flex gap-1">
          {numbers.map((num) => (
            <div
              key={num}
              className={`
                ${gradientClass}
                w-6 h-6 rounded flex items-center justify-center
                text-xs font-bold text-white
              `}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Pause Timer */}
      {isPaused && pauseTimeRemaining > 0 && (
        <div className="mt-4">
          <div className="relative h-1.5 bg-[rgba(251,191,36,0.1)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-1000"
              style={{ width: `${(pauseTimeRemaining / 60) * 100}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-[#F59E0B] mt-2 text-right font-mono">
            {pauseTimeRemaining}s
          </p>
        </div>
      )}
    </Card>
  );
};

export default PlayerInfoCard;