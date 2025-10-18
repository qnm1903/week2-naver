import React, { useRef, useEffect } from 'react';

type PlayerType = 'ODD' | 'EVEN';

interface GameMove {
  square: number;
  value: number;
  player: PlayerType;
  timestamp: number;
}

interface MoveHistoryPanelProps {
  moves: GameMove[];
  isOpen: boolean;
  onToggle: () => void;
}

const MoveHistoryPanel: React.FC<MoveHistoryPanelProps> = ({
  moves,
  isOpen,
  onToggle,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMovesLengthRef = useRef(moves.length);

  // Auto-scroll to latest move when new move added
  useEffect(() => {
    if (isOpen && moves.length > prevMovesLengthRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0; // Scroll to top since we reverse the list
    }
    prevMovesLengthRef.current = moves.length;
  }, [moves.length, isOpen]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      {/* Header */}
      <button
        onClick={onToggle}
        className="
          w-full bg-(--color-cosmic-gray)/60 border border-white/[0.06]
          px-5 py-3 rounded-lg
          hover:bg-(--color-cosmic-gray)/80
          transition-all duration-200
          flex items-center justify-between
        "
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <span className="font-semibold text-white">
            Move History ({moves.length} moves)
          </span>
        </div>
        <span className="text-gray-400 text-xl">{isOpen ? '⌃' : '⌄'}</span>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="mt-2 bg-(--color-cosmic-void) border border-white/[0.06] rounded-lg overflow-hidden">
          {/* History List */}
          <div 
            ref={scrollContainerRef}
            className="max-h-80 overflow-y-auto"
          >
            {moves.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No moves yet</p>
            ) : (
              <div>
                {[...moves].reverse().map((move, index) => {
                  const moveNumber = moves.length - index;
                  const isOdd = move.player === 'ODD';
                  
                  return (
                    <div
                      key={index}
                      className="
                        px-4 py-3
                        border-b border-white/[0.04]
                        hover:bg-white/[0.02]
                        transition-colors duration-150
                      "
                    >
                      <div className="font-mono text-sm grid grid-cols-[40px_60px_1fr_auto] gap-4 items-center">
                        {/* Move Number */}
                        <span className="text-gray-600">#{moveNumber}</span>
                        
                        {/* Player */}
                        <span
                          className={`
                            font-bold
                            ${isOdd ? 'text-gradient-odd' : 'text-gradient-even'}
                          `}
                        >
                          {move.player}
                        </span>
                        
                        {/* Action */}
                        <span className="text-gray-400">
                          clicked{' '}
                          <span className="text-white font-semibold">[{move.square}]</span>
                          {' '}→{' '}
                          <span
                            className={`
                              font-bold
                              ${isOdd ? 'text-gradient-odd' : 'text-gradient-even'}
                            `}
                          >
                            {move.value}
                          </span>
                        </span>
                        
                        {/* Timestamp */}
                        <span className="text-gray-600 text-xs">
                          {formatTime(move.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Replay Controls */}
          {moves.length > 0 && (
            <div className="bg-(--color-cosmic-gray)/40 p-4">
              <div className="flex gap-2 justify-center">
                {[
                  { icon: '⏮️', label: 'Start' },
                  { icon: '⏪', label: '-10' },
                  { icon: '⏯️', label: 'Replay' },
                  { icon: '⏩', label: '+10' },
                  { icon: '⏭️', label: 'Latest' },
                ].map((control) => (
                  <button
                    key={control.label}
                    className="
                      w-10 h-10 rounded-lg
                      bg-transparent border border-white/15
                      hover:bg-[rgb(59_130_246_/_0.1)] hover:border-blue-500
                      transition-all duration-200
                      flex items-center justify-center
                      text-lg
                    "
                    title={control.label}
                  >
                    {control.icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoveHistoryPanel;