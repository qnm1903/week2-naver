import { useEffect, useCallback } from 'react';

interface RoomInfo {
  id: string;
  playerCount: number;
  spectatorCount: number;
  gameStarted: boolean;
  gameOver: boolean;
}

interface RoomListModalProps {
  isOpen: boolean;
  rooms: RoomInfo[];
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
  onRefresh: () => void;
}

export default function RoomListModal({ 
  isOpen, 
  rooms, 
  onClose, 
  onJoinRoom, 
  onRefresh 
}: RoomListModalProps) {
  // Auto-refresh every 3 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      onRefresh();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen, onRefresh]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const getRoomStatus = (room: RoomInfo) => {
    if (room.gameOver) return '🏁 Ended';
    if (room.gameStarted) return '🎮 Playing';
    if (room.playerCount === 1) return '⏳ Waiting';
    return '🔵 Open';
  };

  const getRoomStatusColor = (room: RoomInfo) => {
    if (room.gameOver) return 'text-gray-500';
    if (room.gameStarted) return 'text-yellow-400';
    if (room.playerCount === 1) return 'text-blue-400';
    return 'text-green-400';
  };

  const canJoinRoom = (room: RoomInfo) => {
    return !room.gameOver && room.playerCount < 2;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="
            bg-(--color-cosmic-gray) 
            border border-white/20 
            rounded-2xl 
            shadow-[0_20px_60px_rgba(0,0,0,0.5)]
            max-w-2xl w-full max-h-[80vh]
            animate-[scale-in_200ms_ease-out]
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
              <p className="text-sm text-gray-400 mt-1">
                {rooms.length} room{rooms.length !== 1 ? 's' : ''} found • Auto-refresh every 3s
              </p>
            </div>
            <button
              onClick={onClose}
              className="
                w-10 h-10 rounded-xl
                bg-white/5 hover:bg-white/10
                text-white/60 hover:text-white
                transition-all duration-200
                flex items-center justify-center
              "
            >
              ✕
            </button>
          </div>

          {/* Room List */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏜️</div>
                <p className="text-gray-400 text-lg">No rooms available</p>
                <p className="text-gray-500 text-sm mt-2">Create a new room to start playing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="
                      bg-white/5 hover:bg-white/8
                      border border-white/10
                      rounded-xl p-4
                      transition-all duration-200
                      flex items-center justify-between
                    "
                  >
                    {/* Room Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="font-mono text-lg font-semibold text-white">
                          {room.id}
                        </code>
                        <span className={`text-sm font-medium ${getRoomStatusColor(room)}`}>
                          {getRoomStatus(room)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          👥 Players: {room.playerCount}/2
                        </span>
                        {room.spectatorCount > 0 && (
                          <span>
                            👁️ Spectators: {room.spectatorCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => onJoinRoom(room.id)}
                      disabled={!canJoinRoom(room)}
                      className={`
                        px-6 py-2 rounded-lg
                        font-semibold text-sm
                        transition-all duration-200
                        ${canJoinRoom(room)
                          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30'
                          : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {room.playerCount === 0 ? 'Join' : 
                       room.playerCount === 1 ? 'Join & Play' : 
                       room.gameStarted ? 'Watch' : 
                       'Full'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={onRefresh}
              className="
                flex-1 h-12 rounded-xl
                bg-white/5 hover:bg-white/10
                text-white font-medium
                transition-all duration-200
              "
            >
              🔄 Refresh Now
            </button>
            <button
              onClick={onClose}
              className="
                flex-1 h-12 rounded-xl
                bg-white/10 hover:bg-white/15
                text-white font-medium
                transition-all duration-200
              "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
