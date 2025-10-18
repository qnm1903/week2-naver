# 5x5 Odd/Even Tic-Tac-Toe

A real-time multiplayer game built with React, TypeScript, Socket.io, and Tailwind CSS, featuring gameplay implementation, reconnection handling, and spectator mode for the Naver AI Hackathon.

![ReactJS](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![SocketIO](https://img.shields.io/badge/Socket.io-4.8-green) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## Project Structure

```
src/
├── components/
│   ├── Board.tsx              # 5x5 game board
│   ├── Square.tsx             # Individual square component with animations
│   ├── GameHeader.tsx         # Room ID, spectator count, leave button
│   ├── PlayerInfoCard.tsx     # Player status and pause timer
│   ├── GameOverModal.tsx      # Victory modal with rematch/leave options
│   ├── PauseOverlay.tsx       # Pause screen when opponent disconnects
│   ├── MoveHistoryPanel.tsx   # Move history tracking
│   ├── RoomSelection.tsx      # Home screen for creating/joining rooms
│   ├── RoomListModal.tsx      # Browse available rooms
│   ├── SpectatorBanner.tsx    # Spectator notification
│   └── ui/
│       ├── Button.tsx         # Reusable button component
│       ├── Card.tsx           # Reusable card component
│       └── Input.tsx          # Reusable input component
├── App.tsx                    # Main game component
├── main.tsx                   # App entry point
└── index.css                  # Global styles and animations
server/
└── server.ts                  # Socket.io server with game logic
```

## Technology Stack

- **Frontend**: ReactJS + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Socket.io + TypeScript
- **Real-time Communication**: WebSocket protocol with Socket.io

## Features

### Core Gameplay
- **5x5 board** with simultaneous clicking
- **Two player modes**: ODD (blue) vs EVEN (green)
- Win detection: 5 in a row (horizontal, vertical, diagonal)
- Visual highlight of winning combination
- Move history tracking with player and timestamp

### Multiplayer Features
- **Room system**: Create/join rooms with unique IDs
- **Spectator mode**: 3rd+ players join as view-only spectators
- **Real-time synchonization**: All clients see identical game state
- **Room browser**: List available rooms with number of players

### Reconnection & Persistence
- **Reconnection tokens**: Helps server recognize rejoining player
- **LocalStorage**: Helps remember last game room and token
- **Game pause/resume**: Autopause when a player disconnects, resume on rejoin

## Setup Instructions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd 5x5-naver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the WebSocket server** (Terminal 1)
   ```bash
   npm run server
   ```

4. **Start the development client** (Terminal 2)
   ```bash
   npm run dev
   ```

5. **Open two browser windows**
   - Navigate to `http://localhost:5173` in each window
   - First window -> ODD player (pink)
   - Second window -> EVEN player (green)
   - Additional windows -> Spectators

## How to Play

1. **Create or Join a Room**
   - Click "Create New Room" for a unique room ID
   - Or enter an existing room ID and click on "Join Room"
   - Or browse available rooms from the room list

2. **Make Your Move**
   - Click any square to increment its value
   - Odd numbers appear in pink, even numbers in green

3. **Win Condition**
   - Get 5 of your numbers (all odd or all even) in a row
   - Rows can be: horizontal, vertical, or diagonal

4. **Handle Disconnections**
   - If you disconnect: Game pauses, 60-second timer starts
   - Rejoin before timeout to continue the game
   - If not rejoined in 60 seconds: The opponent wins due to timeout

5. **Game End**
   - After game ends, click "New Game" to rematch
   - Or find a new room to play in