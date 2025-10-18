import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const PAUSE_TIMEOUT_MS = 60000;
const PAUSE_UPDATE_INTERVAL = 1000;

// ============================================================
// TYPES
// ============================================================

interface GameMove {
  square: number;
  value: number;
  player: 'ODD' | 'EVEN';
  timestamp: number;
}

interface Room {
  id: string;
  players: {
    odd: TypedSocket | null;
    even: TypedSocket | null;
  };
  spectators: TypedSocket[];
  board: number[];
  gameStarted: boolean;
  gameOver: boolean;
  gamePaused: boolean;
  pausedAt: number | null;
  pauseTimeout: NodeJS.Timeout | null;
  pauseUpdateInterval: NodeJS.Timeout | null;
  pausedPlayer: 'ODD' | 'EVEN' | null;
  winner: 'ODD' | 'EVEN' | null;
  winningLine: number[];
  moveHistory: GameMove[];
  createdAt: number;
  reconnectionTokens: Map<string, 'ODD' | 'EVEN'>;
}

interface ClientToServerEvents {
  JOIN_ROOM: (data: { roomId: string; reconnectionToken?: string }) => void;
  CREATE_ROOM: () => void;
  LEAVE_ROOM: () => void;
  INCREMENT: (data: { square: number }) => void;
  REQUEST_HISTORY: () => void;
  LIST_ROOMS: () => void;
  REMATCH: () => void;
}

interface RoomInfo {
  id: string;
  playerCount: number;
  spectatorCount: number;
  gameStarted: boolean;
  gameOver: boolean;
}

interface ServerToClientEvents {
  ROOM_CREATED: (data: { roomId: string }) => void;
  PLAYER_ASSIGNED: (data: {
    player: 'ODD' | 'EVEN';
    board: number[];
    gameStarted: boolean;
    gamePaused: boolean;
    gameOver: boolean;
    winner: 'ODD' | 'EVEN' | null;
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
    winner: 'ODD' | 'EVEN' | null;
    winningLine: number[];
    spectatorCount: number;
    moveHistory: GameMove[];
    roomId: string;
  }) => void;
  SPECTATOR_JOINED: (data: { spectatorCount: number }) => void;
  SPECTATOR_LEFT: (data: { spectatorCount: number }) => void;
  GAME_START: (data: { board: number[]; spectatorCount: number }) => void;
  UPDATE: (data: { square: number; value: number; player: 'ODD' | 'EVEN'; timestamp: number }) => void;
  GAME_OVER: (data: {
    winner: 'ODD' | 'EVEN';
    winningLine: number[];
    reason: 'win' | 'opponent_timeout';
  }) => void;
  GAME_PAUSED: (data: {
    pausedBy: 'ODD' | 'EVEN';
    timeRemaining: number;
  }) => void;
  GAME_RESUMED: () => void;
  PAUSE_TIMER_UPDATE: (data: { timeRemaining: number }) => void;
  PLAYER_DISCONNECTED: (data: { player: 'ODD' | 'EVEN' }) => void;
  PLAYER_RECONNECTED: (data: { player: 'ODD' | 'EVEN' }) => void;
  OPPONENT_DISCONNECTED: () => void;
  MOVE_HISTORY: (data: { moves: GameMove[] }) => void;
  ERROR: (data: { message: string }) => void;
  LEFT_ROOM: () => void;
  ROOM_LIST: (data: { rooms: RoomInfo[] }) => void;
}

interface SocketData {
  roomId: string | null;
  role: 'ODD' | 'EVEN' | 'SPECTATOR' | null;
  reconnectionToken: string | null;
}

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

// ============================================================
// GAME STATE
// ============================================================

const rooms = new Map<string, Room>();

// ============================================================
// WIN DETECTION
// ============================================================

const WINNING_LINES: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function checkWinner(board: number[]): { winner: 'ODD' | 'EVEN'; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const values = line.map((i) => board[i]);

    if (values.every((v) => v % 2 === 1 && v > 0)) {
      return { winner: 'ODD', line };
    }

    if (values.every((v) => v % 2 === 0 && v > 0)) {
      return { winner: 'EVEN', line };
    }
  }

  return null;
}

// ============================================================
// ROOM MANAGEMENT
// ============================================================

function generateRoomId(): string {
  return crypto.randomBytes(4).toString('hex');
}

function generateReconnectionToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

function createRoom(roomId?: string): Room {
  const id = roomId || generateRoomId();
  const room: Room = {
    id,
    players: { odd: null, even: null },
    spectators: [],
    board: Array(25).fill(0),
    gameStarted: false,
    gameOver: false,
    gamePaused: false,
    pausedAt: null,
    pauseTimeout: null,
    pauseUpdateInterval: null,
    pausedPlayer: null,
    winner: null,
    winningLine: [],
    moveHistory: [],
    createdAt: Date.now(),
    reconnectionTokens: new Map(),
  };
  rooms.set(id, room);
  console.log(`🏠 Room created: ${id}`);
  return room;
}

function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

function deleteRoom(roomId: string): void {
  const room = rooms.get(roomId);
  if (room) {
    // Clear timers
    if (room.pauseTimeout) clearTimeout(room.pauseTimeout);
    if (room.pauseUpdateInterval) clearInterval(room.pauseUpdateInterval);
    
    rooms.delete(roomId);
    console.log(`🗑️  Room deleted: ${roomId}`);
  }
}

function cleanupEmptyRoom(roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;

  const hasPlayers = room.players.odd || room.players.even;
  const hasSpectators = room.spectators.length > 0;

  if (!hasPlayers && !hasSpectators) {
    deleteRoom(roomId);
  }
}

// ============================================================
// BROADCAST FUNCTIONS
// ============================================================

function broadcastToRoom<K extends keyof ServerToClientEvents>(
  roomId: string,
  event: K,
  ...args: Parameters<ServerToClientEvents[K]>
): void {
  const room = getRoom(roomId);
  if (!room) return;

  if (room.players.odd) room.players.odd.emit(event, ...args);
  if (room.players.even) room.players.even.emit(event, ...args);
  room.spectators.forEach((spectator) => spectator.emit(event, ...args));
}

function getOpponent(room: Room, player: 'ODD' | 'EVEN'): TypedSocket | null {
  return player === 'ODD' ? room.players.even : room.players.odd;
}

// ============================================================
// PAUSE/RESUME LOGIC
// ============================================================

function pauseGame(room: Room, player: 'ODD' | 'EVEN'): void {
  if (room.gamePaused) return;

  room.gamePaused = true;
  room.pausedAt = Date.now();
  room.pausedPlayer = player;

  console.log(`⏸️  Game paused in room ${room.id} - ${player} disconnected`);

  // Broadcast pause
  broadcastToRoom(room.id, 'GAME_PAUSED', {
    pausedBy: player,
    timeRemaining: PAUSE_TIMEOUT_MS / 1000,
  });

  // Update timer every second
  room.pauseUpdateInterval = setInterval(() => {
    if (!room.pausedAt) return;
    
    const elapsed = Date.now() - room.pausedAt;
    const remaining = Math.max(0, Math.floor((PAUSE_TIMEOUT_MS - elapsed) / 1000));

    broadcastToRoom(room.id, 'PAUSE_TIMER_UPDATE', {
      timeRemaining: remaining,
    });
  }, PAUSE_UPDATE_INTERVAL);

  // Set timeout for auto-win
  room.pauseTimeout = setTimeout(() => {
    if (!room.gamePaused || room.gameOver) return;

    const winner = player === 'ODD' ? 'EVEN' : 'ODD';
    room.gameOver = true;
    room.winner = winner;

    console.log(`⏱️  Timeout! ${winner} wins in room ${room.id}`);

    broadcastToRoom(room.id, 'GAME_OVER', {
      winner,
      winningLine: [],
      reason: 'opponent_timeout',
    });

    if (room.pauseUpdateInterval) {
      clearInterval(room.pauseUpdateInterval);
      room.pauseUpdateInterval = null;
    }
  }, PAUSE_TIMEOUT_MS);
}

function resumeGame(room: Room): void {
  if (!room.gamePaused) return;

  room.gamePaused = false;
  room.pausedAt = null;
  room.pausedPlayer = null;

  if (room.pauseTimeout) {
    clearTimeout(room.pauseTimeout);
    room.pauseTimeout = null;
  }

  if (room.pauseUpdateInterval) {
    clearInterval(room.pauseUpdateInterval);
    room.pauseUpdateInterval = null;
  }

  console.log(`▶️  Game resumed in room ${room.id}`);
  broadcastToRoom(room.id, 'GAME_RESUMED');
}

// ============================================================
// JOIN ROOM LOGIC
// ============================================================

function joinRoom(socket: TypedSocket, roomId: string, reconnectionToken?: string): void {
  let room = getRoom(roomId);

  // If reconnection token provided but room doesn't exist, reject
  if (reconnectionToken && !room) {
    socket.emit('ERROR', { message: 'Room does not exist' });
    return;
  }

  // Create room if doesn't exist (only for new joins without token)
  if (!room) {
    room = createRoom(roomId);
  }

  // Check for reconnection
  if (reconnectionToken && room.reconnectionTokens.has(reconnectionToken)) {
    const playerType = room.reconnectionTokens.get(reconnectionToken)!;
    
    // Reconnect player
    if (playerType === 'ODD') {
      room.players.odd = socket;
    } else {
      room.players.even = socket;
    }

    socket.data.roomId = roomId;
    socket.data.role = playerType;
    socket.data.reconnectionToken = reconnectionToken;

    socket.join(roomId);

    console.log(`🔄 Player ${playerType} reconnected to room ${roomId}`);

    // Resume game if was paused (BEFORE sending PLAYER_ASSIGNED)
    if (room.gamePaused && room.pausedPlayer === playerType) {
      resumeGame(room);
    }

    // Notify player
    socket.emit('PLAYER_ASSIGNED', {
      player: playerType,
      board: room.board,
      gameStarted: room.gameStarted,
      gamePaused: room.gamePaused,
      gameOver: room.gameOver,
      winner: room.winner,
      winningLine: room.winningLine,
      spectatorCount: room.spectators.length,
      reconnectionToken,
      moveHistory: room.moveHistory,
      roomId: room.id,
    });

    // Notify others
    broadcastToRoom(roomId, 'PLAYER_RECONNECTED', { player: playerType });

    return;
  }

  // New player/spectator join
  socket.join(roomId);

  if (!room.players.odd) {
    // Assign as ODD player
    const token = generateReconnectionToken();
    room.players.odd = socket;
    room.reconnectionTokens.set(token, 'ODD');

    socket.data.roomId = roomId;
    socket.data.role = 'ODD';
    socket.data.reconnectionToken = token;

    console.log(`👤 ODD player joined room ${roomId}`);

    socket.emit('PLAYER_ASSIGNED', {
      player: 'ODD',
      board: room.board,
      gameStarted: false,
      gamePaused: false,
      gameOver: false,
      winner: null,
      winningLine: [],
      spectatorCount: room.spectators.length,
      reconnectionToken: token,
      moveHistory: room.moveHistory,
      roomId: room.id,
    });

  } else if (!room.players.even) {
    // Assign as EVEN player
    const token = generateReconnectionToken();
    room.players.even = socket;
    room.reconnectionTokens.set(token, 'EVEN');

    socket.data.roomId = roomId;
    socket.data.role = 'EVEN';
    socket.data.reconnectionToken = token;

    console.log(`👤 EVEN player joined room ${roomId}`);

    socket.emit('PLAYER_ASSIGNED', {
      player: 'EVEN',
      board: room.board,
      gameStarted: false,
      gamePaused: false,
      gameOver: false,
      winner: null,
      winningLine: [],
      spectatorCount: room.spectators.length,
      reconnectionToken: token,
      moveHistory: room.moveHistory,
      roomId: room.id,
    });

    // Start game
    room.gameStarted = true;
    broadcastToRoom(roomId, 'GAME_START', {
      board: room.board,
      spectatorCount: room.spectators.length,
    });

    console.log(`🎮 Game started in room ${roomId}`);

  } else {
    // Assign as SPECTATOR
    room.spectators.push(socket);

    socket.data.roomId = roomId;
    socket.data.role = 'SPECTATOR';

    console.log(`👁️  Spectator joined room ${roomId} (total: ${room.spectators.length})`);

    socket.emit('SPECTATOR_ASSIGNED', {
      board: room.board,
      gameStarted: room.gameStarted,
      gamePaused: room.gamePaused,
      gameOver: room.gameOver,
      winner: room.winner,
      winningLine: room.winningLine,
      spectatorCount: room.spectators.length,
      moveHistory: room.moveHistory,
      roomId: room.id,
    });

    // Notify others
    broadcastToRoom(roomId, 'SPECTATOR_JOINED', {
      spectatorCount: room.spectators.length,
    });
  }
}

// ============================================================
// LEAVE ROOM LOGIC
// ============================================================

function leaveRoom(socket: TypedSocket, voluntary: boolean = true): void {
  const roomId = socket.data.roomId;
  const role = socket.data.role;

  if (!roomId) return;

  const room = getRoom(roomId);
  if (!room) return;

  socket.leave(roomId);

  if (role === 'SPECTATOR') {
    // Remove spectator
    room.spectators = room.spectators.filter((s) => s !== socket);
    
    console.log(`👁️  Spectator left room ${roomId} (remaining: ${room.spectators.length})`);

    if (voluntary) {
      socket.emit('LEFT_ROOM');
    }

    broadcastToRoom(roomId, 'SPECTATOR_LEFT', {
      spectatorCount: room.spectators.length,
    });

  } else if (role === 'ODD' || role === 'EVEN') {
    // Player leaving
    if (voluntary) {
      // Player voluntarily left - treat as disconnect
      console.log(`🚪 ${role} player left room ${roomId}`);
    } else {
      console.log(`🔌 ${role} player disconnected from room ${roomId}`);
    }

    // Remove player
    if (role === 'ODD') {
      room.players.odd = null;
    } else {
      room.players.even = null;
    }

    if (voluntary) {
      socket.emit('LEFT_ROOM');
    }

    // Notify opponent
    const opponent = getOpponent(room, role);
    if (opponent) {
      opponent.emit('PLAYER_DISCONNECTED', { player: role });
    }

    // Pause game if started and not over
    if (room.gameStarted && !room.gameOver) {
      pauseGame(room, role);
    }
  }

  // Clear socket data
  socket.data.roomId = null;
  socket.data.role = null;

  // Cleanup if room empty
  cleanupEmptyRoom(roomId);
}

// ============================================================
// SOCKET.IO SERVER
// ============================================================

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
  httpServer,
  {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  }
);

// ============================================================
// EXPRESS MIDDLEWARE TO SERVE FRONTEND
// ============================================================

// Serve static files from dist/client
app.use(express.static(path.join(__dirname, '../dist/client')));

// Fallback to index.html for React Router (SPA)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/client/index.html'), (err: Error | null) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// ============================================================
// SOCKET.IO HANDLERS
// ============================================================

io.on('connection', (socket: TypedSocket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  // Initialize socket data
  socket.data.roomId = null;
  socket.data.role = null;
  socket.data.reconnectionToken = null;

  // CREATE_ROOM
  socket.on('CREATE_ROOM', () => {
    const roomId = generateRoomId();
    createRoom(roomId);

    console.log(`🏗️  Room created by ${socket.id}: ${roomId}`);

    socket.emit('ROOM_CREATED', { roomId });
  });

  // JOIN_ROOM
  socket.on('JOIN_ROOM', (data) => {
    const { roomId, reconnectionToken } = data;

    if (!roomId) {
      socket.emit('ERROR', { message: 'Room ID is required' });
      return;
    }

    // Leave current room if in one
    if (socket.data.roomId) {
      leaveRoom(socket, false);
    }

    joinRoom(socket, roomId, reconnectionToken);
  });

  // LEAVE_ROOM
  socket.on('LEAVE_ROOM', () => {
    leaveRoom(socket, true);
  });

  // INCREMENT
  socket.on('INCREMENT', (data) => {
    const { square } = data;
    const roomId = socket.data.roomId;
    const role = socket.data.role;

    if (!roomId) {
      socket.emit('ERROR', { message: 'Not in a room' });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit('ERROR', { message: 'Room not found' });
      return;
    }

    // Only players can increment
    if (role !== 'ODD' && role !== 'EVEN') {
      socket.emit('ERROR', { message: 'Only players can make moves' });
      return;
    }

    if (room.gameOver) {
      console.log('⚠️  Ignored INCREMENT - Game is over');
      return;
    }

    if (room.gamePaused) {
      console.log('⚠️  Ignored INCREMENT - Game is paused');
      return;
    }

    if (!room.gameStarted) {
      console.log('⚠️  Ignored INCREMENT - Waiting for both players');
      return;
    }

    if (square < 0 || square >= 25) {
      console.log('⚠️  Invalid square index:', square);
      return;
    }

    // Apply increment
    room.board[square] += 1;

    const timestamp = Date.now();

    // Record move
    room.moveHistory.push({
      square,
      value: room.board[square],
      player: role,
      timestamp,
    });

    console.log(`Square ${square} → ${room.board[square]} by ${role} in room ${roomId}`);

    // Broadcast update with move info
    broadcastToRoom(roomId, 'UPDATE', {
      square,
      value: room.board[square],
      player: role,
      timestamp,
    });

    // Check winner
    const result = checkWinner(room.board);
    if (result) {
      room.gameOver = true;
      room.winner = result.winner;
      room.winningLine = result.line;

      console.log(`🏆 ${result.winner} wins in room ${roomId}!`);

      broadcastToRoom(roomId, 'GAME_OVER', {
        winner: result.winner,
        winningLine: result.line,
        reason: 'win',
      });
    }
  });

  // REQUEST_HISTORY
  socket.on('REQUEST_HISTORY', () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const room = getRoom(roomId);
    if (!room) return;

    socket.emit('MOVE_HISTORY', {
      moves: room.moveHistory,
    });
  });

  // REMATCH - Reset game for a rematch
  socket.on('REMATCH', () => {
    const roomId = socket.data.roomId;
    const role = socket.data.role;

    if (!roomId) {
      socket.emit('ERROR', { message: 'Not in a room' });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit('ERROR', { message: 'Room not found' });
      return;
    }

    // Only players can request rematch
    if (role !== 'ODD' && role !== 'EVEN') {
      socket.emit('ERROR', { message: 'Only players can request rematch' });
      return;
    }

    // Both players must be present
    if (!room.players.odd || !room.players.even) {
      socket.emit('ERROR', { message: 'Both players must be present for rematch' });
      return;
    }

    // Reset game state
    room.board = Array(25).fill(0);
    room.gameOver = false;
    room.winner = null;
    room.winningLine = [];
    room.moveHistory = [];
    room.gamePaused = false;
    room.pausedAt = null;
    room.pausedPlayer = null;

    // Clear timers
    if (room.pauseTimeout) {
      clearTimeout(room.pauseTimeout);
      room.pauseTimeout = null;
    }
    if (room.pauseUpdateInterval) {
      clearInterval(room.pauseUpdateInterval);
      room.pauseUpdateInterval = null;
    }

    console.log(`🔄 Rematch started in room ${roomId}`);

    // Notify all players and spectators
    broadcastToRoom(roomId, 'GAME_START', {
      board: room.board,
      spectatorCount: room.spectators.length,
    });
  });

  // LIST_ROOMS - Get all available rooms
  socket.on('LIST_ROOMS', () => {
    const roomList: RoomInfo[] = Array.from(rooms.values()).map(room => ({
      id: room.id,
      playerCount: (room.players.odd ? 1 : 0) + (room.players.even ? 1 : 0),
      spectatorCount: room.spectators.length,
      gameStarted: room.gameStarted,
      gameOver: room.gameOver,
    }));

    socket.emit('ROOM_LIST', { rooms: roomList });
  });

  // DISCONNECT
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Disconnected: ${socket.id} (${reason})`);
    leaveRoom(socket, false);
  });
});

// ============================================================
// START SERVER
// ============================================================

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server is running`);
});