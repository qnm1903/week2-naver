import React from 'react';

type PlayerType = 'ODD' | 'EVEN';

interface GameOverModalProps {
  winner: PlayerType;
  winningLine: number[];
  reason?: 'win' | 'opponent_timeout';
  onNewGame: () => void;
  onLeaveRoom: () => void;
  onClose?: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  winningLine,
  reason = 'win',
  onNewGame,
  onLeaveRoom,
  onClose,
}) => {
  const isOdd = winner === 'ODD';
  const gradientClass = isOdd ? 'gradient-odd' : 'gradient-even';
  const textGradientClass = isOdd ? 'text-gradient-odd' : 'text-gradient-even';

  const winningText =
    reason === 'opponent_timeout'
      ? `${winner} wins by timeout`
      : winningLine.length > 0
      ? `5 ${winner.toLowerCase()} numbers in a line`
      : `${winner} wins!`;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-[rgba(10,14,20,0.85)] backdrop-blur-sm
        flex items-center justify-center
        animate-[pause-entrance_300ms_ease-out]
      "
      onClick={onClose} // Click backdrop to close
    >
      <div
        className={`
          bg-gradient-to-br from-[rgba(28,33,40,0.95)] to-[rgba(15,20,25,0.95)]
          border-2
          ${isOdd ? 'border-[#FF6B9D]' : 'border-[#4ECDC4]'}
          rounded-2xl p-12 max-w-md w-full mx-4
          shadow-[0_20px_80px_rgba(0,0,0,0.5)]
          animate-[victory-scale_500ms_ease-out]
          relative
        `}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="
              absolute top-4 right-4
              w-8 h-8 rounded-full
              bg-white/10 hover:bg-white/20
              flex items-center justify-center
              transition-colors duration-200
              text-white text-xl
            "
            title="Close to view final board"
          >
            ×
          </button>
        )}

        {/* Victory Icon */}
        <div className="flex justify-center mb-6">
          <div className="text-8xl">🎉</div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-white text-center mb-4">
          VICTORY!
        </h2>

        {/* Winner */}
        <h3 className={`text-5xl font-extrabold ${textGradientClass} text-center mb-6`}>
          {winner} WINS
        </h3>

        {/* Winning Line Visual */}
        {winningLine.length > 0 && (
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`
                  ${gradientClass}
                  w-8 h-8 rounded
                  shadow-[0_0_20px_currentColor]
                `}
              />
            ))}
          </div>
        )}

        {/* Winning Condition Text */}
        <p className="text-lg font-medium text-gray-400 text-center mb-8">
          {winningText}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className={`
              w-full ${gradientClass}
              px-6 py-4 rounded-xl
              text-lg font-semibold text-white
              shadow-lg
              hover:brightness-110
              transition-all duration-200
              flex items-center justify-center gap-2
            `}
          >
            <span className="text-xl">🔄</span>
            New Game
          </button>

          <button
            onClick={onLeaveRoom}
            className="
              w-full bg-transparent border border-white/20
              px-6 py-4 rounded-xl
              text-lg font-semibold text-white
              hover:bg-white/5
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <span className="text-xl">🏠</span>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;