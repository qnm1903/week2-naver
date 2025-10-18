import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Board from './components/Board';
import RoomSelection from './components/RoomSelection';
import GameHeader from './components/GameHeader';
import PlayerInfoCard from './components/PlayerInfoCard';
import SpectatorBanner from './components/SpectatorBanner';
import PauseOverlay from './components/PauseOverlay';
import GameOverModal from './components/GameOverModal';
import MoveHistoryPanel from './components/MoveHistoryPanel';
import RoomListModal from './components/RoomListModal';

type PlayerType = 'ODD' | 'EVEN';
type Role = 'ODD' | 'EVEN' | 'SPECTATOR' | null;
type Screen = 'HOME' | 'GAME';

interface GameMove {
  square: number;
  value: number;
  player: PlayerType;
  timestamp: number;
}

interface ServerToClientEvents {
  ROOM_CREATED: (data: { roomId: string }) => void;
  PLAYER_ASSIGNED: (data: {
    player: PlayerType;
    board: number[];
    gameStarted: boolean;
    gamePaused: boolean;
    gameOver: boolean;
    winner: PlayerType | null;
    winningLine: number[];
    spectatorCount: number;
    reconnectionToken: string;
    moveHistory: GameMove[];
    roomId: string;
  }) => void;
  SPECTATOR_ASSIGNED: (data: {
    board: number[];
    gameStarted: boolean;
    gamePaused: boolean;
    gameOver: boolean;
    winner: PlayerType | null;
    winningLine: number[];
    spectatorCount: number;
    moveHistory: GameMove[];
    roomId: string;
  }) => void;
  GAME_START: (data: { board: number[]; spectatorCount: number }) => void;
  UPDATE: (data: { square: number; value: number; player: PlayerType; timestamp: number }) => void;
  GAME_OVER: (data: {
    winner: PlayerType;
    winningLine: number[];
    reason?: 'opponent_timeout';
  }) => void;
  GAME_PAUSED: (data: { pausedBy: PlayerType; timeRemaining: number }) => void;
  PAUSE_TIMER_UPDATE: (data: { timeRemaining: number }) => void;
  GAME_RESUMED: () => void;
  PLAYER_RECONNECTED: (data: { player: PlayerType }) => void;
  PLAYER_DISCONNECTED: (data: { player: PlayerType }) => void;
  SPECTATOR_JOINED: (data: { spectatorCount: number }) => void;
  SPECTATOR_LEFT: (data: { spectatorCount: number }) => void;
  LEFT_ROOM: () => void;
  MOVE_HISTORY: (data: { moves: GameMove[] }) => void;
  ERROR: (data: { message: string }) => void;
  ROOM_LIST: (data: { rooms: RoomInfo[] }) => void;
}

interface RoomInfo {
  id: string;
  playerCount: number;
  spectatorCount: number;
  gameStarted: boolean;
  gameOver: boolean;
}

interface ClientToServerEvents {
  CREATE_ROOM: () => void;
  JOIN_ROOM: (data: { roomId: string; reconnectionToken?: string }) => void;
  LEAVE_ROOM: () => void;
  INCREMENT: (data: { square: number }) => void;
  REQUEST_HISTORY: () => void;
  LIST_ROOMS: () => void;
  REMATCH: () => void;
}

function App() {
  // Socket & Screen
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [screen, setScreen] = useState<Screen>('HOME');
  
  // Room & Player State
  const [roomId, setRoomId] = useState<string>('');
  const [role, setRole] = useState<Role>(null);
  const [player, setPlayer] = useState<PlayerType | null>(null);
  
  // Game State
  const [board, setBoard] = useState<number[]>(Array(25).fill(0));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PlayerType | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  
  // Pause State
  const [gamePaused, setGamePaused] = useState(false);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState(0);
  const [pausedBy, setPausedBy] = useState<PlayerType | null>(null);
  
  // Spectator State
  const [spectatorCount, setSpectatorCount] = useState(0);
  
  // Move History
  const [moveHistory, setMoveHistory] = useState<GameMove[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Room List Modal
  const [showRoomList, setShowRoomList] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  
  // Game Over Modal
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // ============================================================
  // SOCKET.IO SETUP
  // ============================================================
  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:8080', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Room Events
    newSocket.on('ROOM_CREATED', (data) => {
      setRoomId(data.roomId);
      // Auto-join created room
      newSocket.emit('JOIN_ROOM', { roomId: data.roomId });
    });
    
    newSocket.on('PLAYER_ASSIGNED', (data) => {
      setPlayer(data.player);
      setRole(data.player);
      setBoard(data.board);
      setGameStarted(data.gameStarted);
      setGamePaused(data.gamePaused); // Set pause state on reconnection
      setSpectatorCount(data.spectatorCount);
      setMoveHistory(data.moveHistory);
      setRoomId(data.roomId);
      
      // Set game over state if joining after game ended
      setGameOver(data.gameOver);
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setShowGameOverModal(data.gameOver); // Show modal if game is over
      
      // Save last game room and its token
      const oldLastGame = localStorage.getItem('last_game');
      if (oldLastGame && oldLastGame !== data.roomId) {
        // Remove old room's token when switching to new room
        localStorage.removeItem(`token_${oldLastGame}`);
      }
      localStorage.setItem('last_game', data.roomId);
      localStorage.setItem(`token_${data.roomId}`, data.reconnectionToken);
      
      setScreen('GAME');
    });
    
    newSocket.on('SPECTATOR_ASSIGNED', (data) => {
      setRole('SPECTATOR');
      setBoard(data.board);
      setGameStarted(data.gameStarted);
      setGamePaused(data.gamePaused);
      setSpectatorCount(data.spectatorCount);
      setMoveHistory(data.moveHistory);
      setRoomId(data.roomId);
      
      // Set game over state if joining after game ended
      setGameOver(data.gameOver);
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setShowGameOverModal(data.gameOver); // Show modal if game is over
      
      setScreen('GAME');
    });
    
    // Game Events
    newSocket.on('GAME_START', (data) => {
      setGameStarted(true);
      setBoard(data.board);
      setGameOver(false);
      setWinner(null);
      setWinningLine([]);
      setMoveHistory([]); // Reset move history for new game
      setSpectatorCount(data.spectatorCount);
      setShowGameOverModal(false); // Close modal if open
    });
    
    newSocket.on('UPDATE', (data) => {
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[data.square] = data.value;
        return newBoard;
      });
      
      // Add move to history
      setMoveHistory(prev => [...prev, {
        square: data.square,
        value: data.value,
        player: data.player,
        timestamp: data.timestamp,
      }]);
    });
    
    newSocket.on('GAME_OVER', (data) => {
      setGameOver(true);
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setGamePaused(false);
      setShowGameOverModal(true); // Show modal on game end
    });
    
    // Pause/Resume Events
    newSocket.on('GAME_PAUSED', (data) => {
      setGamePaused(true);
      setPauseTimeRemaining(data.timeRemaining);
      setPausedBy(data.pausedBy);
    });
    
    newSocket.on('PAUSE_TIMER_UPDATE', (data) => {
      setPauseTimeRemaining(data.timeRemaining);
    });
    
    newSocket.on('GAME_RESUMED', () => {
      setGamePaused(false);
      setPauseTimeRemaining(0);
      setPausedBy(null);
    });
    
    // Spectator Events
    newSocket.on('SPECTATOR_JOINED', (data) => {
      setSpectatorCount(data.spectatorCount);
    });
    
    newSocket.on('SPECTATOR_LEFT', (data) => {
      setSpectatorCount(data.spectatorCount);
    });
    
    // Leave Room
    newSocket.on('LEFT_ROOM', () => {
      setScreen('HOME');
      resetGameState();
    });
    
    // Move History
    newSocket.on('MOVE_HISTORY', (data) => {
      setMoveHistory(data.moves);
    });
    
    // Error
    newSocket.on('ERROR', (data) => {
      console.error(data.message);
      
      // If error is about room not found, clean up localStorage
      if (data.message.includes('not found') || data.message.includes('does not exist')) {
        const lastGame = localStorage.getItem('last_game');
        if (lastGame) {
          localStorage.removeItem('last_game');
          localStorage.removeItem(`token_${lastGame}`);
        }
      }
      
      alert(data.message);
    });

    // Room List
    newSocket.on('ROOM_LIST', (data) => {
      setAvailableRooms(data.rooms);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  // Reset all game state to initial values
  const resetGameState = useCallback(() => {
    setRoomId('');
    setRole(null);
    setPlayer(null);
    setBoard(Array(25).fill(0));
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setWinningLine([]);
    setGamePaused(false);
    setPauseTimeRemaining(0);
    setPausedBy(null);
    setSpectatorCount(0);
    setMoveHistory([]);
    setShowHistory(false);
  }, []);

  // Create a new game room
  const handleCreateRoom = useCallback(() => {
    socket?.emit('CREATE_ROOM');
  }, [socket]);

  // Join existing room (with reconnection token if available)
  const handleJoinRoom = useCallback((inputRoomId: string) => {
    const token = localStorage.getItem(`token_${inputRoomId}`);
    
    socket?.emit('JOIN_ROOM', {
      roomId: inputRoomId,
      reconnectionToken: token || undefined,
    });
  }, [socket]);

  // Rejoin the most recent room from localStorage
  const handleRejoinLastRoom = useCallback(() => {
    const lastGame = localStorage.getItem('last_game');
    if (lastGame) {
      handleJoinRoom(lastGame);
    }
  }, [handleJoinRoom]);

  const handleSquareClick = useCallback((index: number) => {
    if (role === 'SPECTATOR' || !gameStarted || gameOver || gamePaused) {
      return;
    }
    socket?.emit('INCREMENT', { square: index });
  }, [role, gameStarted, gameOver, gamePaused, socket]);

  // Copy room ID to clipboard
  const handleCopyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId);
  }, [roomId]);

  // Leave current room
  const handleLeaveRoom = useCallback(() => {
    socket?.emit('LEAVE_ROOM');
  }, [socket]);

  const handleNewGame = useCallback(() => {
    socket?.emit('REMATCH');
    setShowGameOverModal(false);
  }, [socket]);

  const handleToggleHistory = useCallback(() => {
    setShowHistory(prev => !prev);
  }, []);

  const handleShowRoomList = useCallback(() => {
    socket?.emit('LIST_ROOMS');
    setShowRoomList(true);
  }, [socket]);

  const handleJoinRoomFromList = useCallback((selectedRoomId: string) => {
    setShowRoomList(false);
    socket?.emit('JOIN_ROOM', {
      roomId: selectedRoomId,
      reconnectionToken: undefined,
    });
  }, [socket]);

  // Track localStorage changes for rejoin button visibility
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const [lastRoomId, setLastRoomId] = useState<string | undefined>(undefined);

  // Check localStorage on mount and when returning to HOME screen
  useEffect(() => {
    if (screen === 'HOME') {
      const lastGame = localStorage.getItem('last_game');
      setHasStoredToken(!!lastGame);
      setLastRoomId(lastGame || undefined);
    }
  }, [screen]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-(--color-cosmic-void) text-white">
      {/* HOME SCREEN */}
      {screen === 'HOME' && (
        <>
          <RoomSelection
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            hasStoredToken={hasStoredToken}
            onRejoinRoom={handleRejoinLastRoom}
            lastRoomId={lastRoomId}
            onShowRoomList={handleShowRoomList}
          />
          <RoomListModal
            isOpen={showRoomList}
            rooms={availableRooms}
            onClose={() => setShowRoomList(false)}
            onJoinRoom={handleJoinRoomFromList}
            onRefresh={handleShowRoomList}
          />
        </>
      )}

      {/* GAME SCREEN */}
      {screen === 'GAME' && (
        <>
          {/* Header */}
          <GameHeader
            roomId={roomId}
            spectatorCount={spectatorCount}
            onCopyRoomId={handleCopyRoomId}
            onLeaveRoom={handleLeaveRoom}
          />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Spectator Banner */}
            {role === 'SPECTATOR' && <SpectatorBanner />}

            {/* Game Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
              {/* Left Sidebar - Player Cards (Desktop) */}
              <div className="hidden lg:block space-y-4">
                <PlayerInfoCard
                  player="ODD"
                  isYou={player === 'ODD'}
                  isActive={gameStarted && !gameOver && !gamePaused}
                  isPaused={gamePaused && pausedBy === 'ODD'}
                  pauseTimeRemaining={pausedBy === 'ODD' ? pauseTimeRemaining : 0}
                />
                <PlayerInfoCard
                  player="EVEN"
                  isYou={player === 'EVEN'}
                  isActive={gameStarted && !gameOver && !gamePaused}
                  isPaused={gamePaused && pausedBy === 'EVEN'}
                  pauseTimeRemaining={pausedBy === 'EVEN' ? pauseTimeRemaining : 0}
                />
              </div>

              {/* Center - Game Board */}
              <div className="flex flex-col items-center">
                {/* Mobile Player Cards */}
                <div className="lg:hidden grid grid-cols-2 gap-4 w-full max-w-3xl mb-6">
                  <PlayerInfoCard
                    player="ODD"
                    isYou={player === 'ODD'}
                    isActive={gameStarted && !gameOver && !gamePaused}
                    isPaused={gamePaused && pausedBy === 'ODD'}
                    pauseTimeRemaining={pausedBy === 'ODD' ? pauseTimeRemaining : 0}
                  />
                  <PlayerInfoCard
                    player="EVEN"
                    isYou={player === 'EVEN'}
                    isActive={gameStarted && !gameOver && !gamePaused}
                    isPaused={gamePaused && pausedBy === 'EVEN'}
                    pauseTimeRemaining={pausedBy === 'EVEN' ? pauseTimeRemaining : 0}
                  />
                </div>

                {/* Board - Always visible, no turn restrictions! */}
                <Board
                  board={board}
                  onSquareClick={handleSquareClick}
                  disabled={role === 'SPECTATOR' || !gameStarted || gameOver || gamePaused}
                  winningLine={winningLine}
                />

                {/* Game Status - No turns, both can play! */}
                {gameStarted && !gameOver && !gamePaused && (
                  <p className="mt-6 text-xl font-semibold text-gray-300">
                    🎮 Click on any square to increment
                  </p>
                )}

                {!gameStarted && (
                  <p className="mt-6 text-xl text-gray-400">
                    Waiting for opponent...
                  </p>
                )}

                {/* Move History */}
                <MoveHistoryPanel
                  moves={moveHistory}
                  isOpen={showHistory}
                  onToggle={handleToggleHistory}
                />
              </div>
            </div>
          </div>

          {/* Pause Overlay */}
          {gamePaused && pausedBy && (
            <PauseOverlay
              pausedBy={pausedBy}
              timeRemaining={pauseTimeRemaining}
              winnerIfTimeout={pausedBy === 'ODD' ? 'EVEN' : 'ODD'}
            />
          )}

          {/* Game Over Modal - Can be closed to view final board */}
          {gameOver && winner && showGameOverModal && (
            <GameOverModal
              winner={winner}
              winningLine={winningLine}
              reason={winningLine.length === 0 ? 'opponent_timeout' : 'win'}
              onNewGame={handleNewGame}
              onLeaveRoom={handleLeaveRoom}
              onClose={() => setShowGameOverModal(false)}
            />
          )}

          {/* Floating button to reopen modal after closing */}
          {gameOver && winner && !showGameOverModal && (
            <button
              onClick={() => setShowGameOverModal(true)}
              className="
                fixed bottom-6 right-6
                w-14 h-14 rounded-full
                bg-gradient-to-br from-purple-500 to-pink-500
                hover:from-purple-600 hover:to-pink-600
                shadow-[0_8px_24px_rgba(168,85,247,0.4)]
                hover:shadow-[0_12px_32px_rgba(168,85,247,0.6)]
                transition-all duration-200
                flex items-center justify-center
                text-2xl
                hover:scale-110
                z-50
              "
              title="Show game results"
            >
              🏆
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default App;