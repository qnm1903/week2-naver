import React, { useRef, useEffect } from 'react';

interface GameHeaderProps {
  roomId: string;
  spectatorCount: number;
  onCopyRoomId: () => void;
  onLeaveRoom: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  roomId,
  spectatorCount,
  onCopyRoomId,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    onCopyRoomId();
    setCopied(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, 2000);
  };

  return (
    <header
      className="
        sticky top-0 z-40
        bg-(--color-cosmic-gray)/80 backdrop-blur-xl
        border-b border-white/5
        px-4 md:px-8 py-4
      "
    >
      <div className="flex items-center justify-between">
        {/* Room ID */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Room:</span>
          <span className="font-mono text-base font-semibold text-white">
            {roomId}
          </span>
          <button
            onClick={handleCopy}
            className="
              w-8 h-8 rounded-lg
              hover:bg-white/10
              transition-colors duration-200
              flex items-center justify-center
            "
            title="Copy room link"
          >
            {copied ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-gray-400">📋</span>
            )}
          </button>
        </div>

        {/* Center - Spectator Count */}
        <div
          className="
            bg-[rgb(245_158_11_/_0.1)]
            px-3 py-1.5 rounded-lg
            flex items-center gap-2
          "
        >
          <span className="text-lg">👁️</span>
          <span className="text-sm font-semibold text-[#F59E0B]">
            {spectatorCount} watching
          </span>
        </div>

        {/* Leave Button */}
        <button
          onClick={onLeaveRoom}
          className="
            bg-transparent border border-red-500/30
            px-4 py-2 rounded-lg
            text-sm font-semibold text-red-500
            hover:bg-red-500/10
            transition-all duration-200
            flex items-center gap-2
          "
        >
          <span>🚪</span>
          Leave
        </button>
      </div>
    </header>
  );
};

export default GameHeader;