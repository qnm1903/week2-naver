import React, { useRef, useEffect, useCallback } from 'react';

interface RoomSelectionProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  hasStoredToken?: boolean;
  onRejoinRoom?: () => void;
  lastRoomId?: string;
  onShowRoomList?: () => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({
  onCreateRoom,
  onJoinRoom,
  hasStoredToken = false,
  onRejoinRoom,
  lastRoomId,
  onShowRoomList,
}) => {
  const [roomId, setRoomId] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Join room after validating input
  const handleJoinRoom = useCallback(() => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  }, [roomId, onJoinRoom]);

  // Handle Enter key to join room
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  }, [handleJoinRoom]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Hero Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 border-2 border-gray-500 rounded-lg grid grid-cols-5 gap-[2px] p-2">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="bg-gray-600/30 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4 font-primary">
            Odd vs Even
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Strategic tic-tac-toe where parity determines victory patterns
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Create Room Button */}
          <button
            onClick={onCreateRoom}
            className="
              w-full h-14 rounded-xl
              gradient-info text-white text-lg font-semibold
              shadow-[0_4px_20px_rgb(59_130_246_/_0.3)]
              hover:shadow-[0_8px_32px_rgb(59_130_246_/_0.4)] hover:-translate-y-0.5
              active:translate-y-0 active:shadow-[0_2px_12px_rgb(59_130_246_/_0.3)]
              transition-all duration-300
              flex items-center justify-center gap-3
            "
          >
            <span className="text-xl">+</span>
            Create Private Room
          </button>

          {/* Join Room */}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter Room ID..."
              value={roomId}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="
                flex-1 h-14 px-5 rounded-xl
                bg-(--color-cosmic-gray) border border-white/10
                font-mono text-base font-medium text-white
                placeholder:text-gray-500
                focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10
                transition-all duration-200
              "
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="
                h-14 px-6 rounded-xl
                bg-transparent border-2 border-white/20 text-white
                hover:border-blue-500/50 hover:bg-blue-500/10
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center gap-2
                font-semibold
              "
            >
              <span>→</span>
              Join Room
            </button>
          </div>

          {/* Browse Rooms Button */}
          {onShowRoomList && (
            <button
              onClick={onShowRoomList}
              className="
                w-full h-14 rounded-xl
                bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-white/20
                text-white text-base font-medium
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <span className="text-xl">📋</span>
              Browse Available Rooms
            </button>
          )}

          {/* Rejoin Last Game */}
          {hasStoredToken && onRejoinRoom && (
            <button
              onClick={onRejoinRoom}
              className="
                w-full h-14 px-5 rounded-xl
                bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)]
                text-[#F59E0B] font-semibold
                hover:bg-[rgba(251,191,36,0.15)]
                transition-all duration-200
                flex items-center justify-center gap-3
              "
            >
              <span className="text-lg">🔄</span>
              Rejoin Last Game
              {lastRoomId && (
                <span className="font-mono text-sm opacity-75">(#{lastRoomId})</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSelection;
