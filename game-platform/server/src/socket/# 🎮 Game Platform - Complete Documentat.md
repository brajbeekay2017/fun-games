# 🎮 Game Platform - Complete Documentation

## 📋 Overview

**Game Platform** is an interactive multiplayer game application built with modern web technologies. Currently featuring **Tic-Tac-Toe** with both single-player (vs Computer AI) and multiplayer modes.

### Key Features
- ✅ Real-time multiplayer gameplay using Socket.IO
- ✅ Single-player mode with intelligent computer opponent (Minimax algorithm)
- ✅ Responsive UI with Tailwind CSS
- ✅ Modular architecture for easy game expansion
- ✅ Server-side game logic validation
- ✅ Room-based game management

---

## 🏗️ Architecture

### Frontend Stack
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **React Router** - Client-side routing

### Backend Stack
- **Node.js** - Runtime
- **Express.js** - HTTP server
- **Socket.IO** - WebSocket communication
- **Nodemon** - Development auto-reload

### Shared
- **Constants** - Shared event names and game rules

---

## 📁 Project Structure

```
fun-games/
├── game-platform/
│   ├── client/                          # React frontend
│   │   ├── src/
│   │   │   ├── components/game/         # Board, Cell, GameStatus
│   │   │   ├── games/tic-tac-toe/       # Game UI component
│   │   │   ├── hooks/useSocket.js       # Socket connection hook
│   │   │   ├── pages/                   # HomePage, TicTacToePage
│   │   │   ├── store/gameStore.js       # Zustand state
│   │   │   ├── App.jsx                  # Main app component
│   │   │   └── main.jsx                 # Entry point
│   │   ├── index.html                   # HTML template
│   │   ├── vite.config.js               # Vite config
│   │   ├── tailwind.config.js           # Tailwind config
│   │   ├── postcss.config.js            # PostCSS config
│   │   ├── package.json
│   │   └── .env                         # Client env variables
│   │
│   ├── server/                          # Express backend
│   │   ├── src/
│   │   │   ├── games/
│   │   │   │   └── ticTacToe.logic.js   # Game logic & AI
│   │   │   ├── socket/
│   │   │   │   └── game.socket.js       # Socket event handlers
│   │   │   └── app.js                   # Express app
│   │   ├── server.js                    # Server entry point
│   │   ├── package.json
│   │   └── .env                         # Server env variables
│   │
│   ├── shared/
│   │   └── gameConstants.js             # Event names & rules
│   │
│   └── package.json                     # Game-platform scripts
│
├── DOCUMENTATION.md                     # This file
├── SETUP_GUIDE.md                       # Setup instructions
├── RUNNING_GUIDE.md                     # How to run from VS Code
├── API_REFERENCE.md                     # Socket.IO events
├── TROUBLESHOOTING.md                   # Common issues
├── package.json                         # Root scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v16+ installed
- **npm** v8+ installed
- **Visual Studio Code** (optional)
- **Git** (optional, for version control)

### Installation

```bash
# 1. Navigate to project directory
cd D:\Projects\fun-games

# 2. Install all dependencies
npm run install-all

# 3. Start development servers
npm run dev
```

**Expected Output:**
```
[0] 🎮 Game Server running on port 3000
[1] ➜  Local:   http://localhost:5173/
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 🎮 How to Play

### Home Page
1. Click **🤖 Play vs Computer** to play against AI
2. Click **👥 Create Multiplayer Game** to create a room for friends
3. Enter a Room ID and click **Join Multiplayer** to join an existing game

### Game Rules
- **Tic-Tac-Toe**: First player to get 3 in a row (horizontal, vertical, or diagonal) wins
- **You**: Always play as **X**
- **Computer/Opponent**: Plays as **O**
- **Draw**: If all 9 cells are filled with no winner

### Controls
- Click any empty cell to make your move
- Computer moves automatically after 1 second
- Click "Play Again" to start a new game

---

## 🔌 Socket Events

### Client → Server

**JOIN_GAME**
```javascript
socket.emit('JOIN_GAME', {
  roomId: 'room-single-1234567890',
  playerId: 'player-9876543210',
  gameMode: 'single-player' // or 'multiplayer'
})
```

**MAKE_MOVE**
```javascript
socket.emit('MAKE_MOVE', {
  roomId: 'room-single-1234567890',
  playerId: 'player-9876543210',
  cellIndex: 4 // 0-8
})
```

**LEAVE_GAME**
```javascript
socket.emit('LEAVE_GAME')
```

### Server → Client

**GAME_STATE_UPDATE**
```javascript
{
  roomId: 'room-single-1234567890',
  board: [null, 'X', null, null, 'O', null, null, null, null],
  currentPlayer: 'player-9876543210',
  players: ['player-9876543210', 'COMPUTER'],
  winner: null,
  isFull: false,
  moveCount: 2,
  gameMode: 'single-player'
}
```

**PLAYER_JOINED**
```javascript
{ message: 'Game started!' }
```

**GAME_OVER**
```javascript
{
  winner: 'player-9876543210', // or 'COMPUTER' or null
  isDraw: false
}
```

**ERROR**
```javascript
'Invalid cell index' // Error message string
```

---

## 🧩 Key Components

### Frontend Components

#### `HomePage.jsx`
- Game mode selection (Single-player/Multiplayer)
- Room ID input for joining
- Navigation to game page

#### `TicTacToePage.jsx`
- Socket connection management
- Game joining logic
- Move event handling
- State synchronization

#### `TicTacToeGame.jsx`
- Main game UI
- Displays board, player info, game status
- Handles cell clicks
- Shows winner/draw/turn info

#### `Board.jsx` & `Cell.jsx`
- Renders 3×3 grid
- Shows X and O symbols
- Handles cell click events
- Disables filled/invalid cells

#### `GameStatus.jsx`
- Displays game status messages
- Shows whose turn it is
- Announces winner or draw

### Backend Components

#### `TicTacToeGame` (Class)
- Game state management
- Move validation
- Win checking
- Minimax AI implementation
- Computer move generation

#### `game.socket.js`
- Socket event handlers (JOIN_GAME, MAKE_MOVE, LEAVE_GAME)
- Room management
- Game state broadcasting
- Computer move timing
- Game cleanup

#### `gameStore.js` (Zustand)
- Client-side game state storage
- Error state management
- Logging for debugging

---

## 🤖 Game Logic - Tic-Tac-Toe

### Board Representation
- **Size**: 3×3 grid
- **Cells**: Indexed 0-8 (left-to-right, top-to-bottom)
- **Players**: X (human) and O (computer/opponent)
- **State**: `null` (empty), 'X', or 'O'

### Win Conditions
Winning patterns (8 total):
```
Rows:       Columns:    Diagonals:
[0,1,2]     [0,3,6]     [0,4,8]
[3,4,5]     [1,4,7]     [2,4,6]
[6,7,8]     [2,5,8]
```

### Computer AI (Minimax Algorithm)

The computer uses the **Minimax algorithm** to find the best move:

**Difficulty Levels:**
- **Easy**: Random valid moves
- **Medium**: 50% smart moves, 50% random
- **Hard**: Always plays optimally (unbeatable)

**How it works:**
1. For each available cell, the algorithm simulates playing that move
2. It recursively evaluates all possible future game states
3. Scores each move: +10 for computer win, -10 for player win, 0 for draw
4. Returns the move with the highest score
5. Computer plays unbeatable at Hard difficulty

---

## 📦 Available Scripts

### Root Directory

```bash
npm run dev              # Start both client & server
npm run server          # Start server only
npm run client          # Start client only
npm run install-all     # Install all dependencies
```

### Game-Platform Directory

```bash
cd game-platform
npm run dev             # Start client & server together
npm run server          # Start server
npm run client          # Start client
npm run build           # Build client for production
```

### Server Directory

```bash
cd game-platform/server
npm run dev             # Start with nodemon (auto-reload)
npm run start           # Start production server
```

### Client Directory

```bash
cd game-platform/client
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

---

## 🚀 Next Steps / Future Features

### Phase 2
- [ ] Quiz game
- [ ] Leaderboard system
- [ ] User authentication
- [ ] Game statistics tracking

### Phase 3
- [ ] Memory card game
- [ ] Sound effects & music
- [ ] Animations
- [ ] Mobile optimization

### Phase 4
- [ ] Database integration (MongoDB)
- [ ] User profiles
- [ ] Chat/messaging
- [ ] Replay system

---

## 📞 Support

For issues or questions, refer to the dedicated troubleshooting guide or check the console logs.

---

**Happy Gaming! 🎮**