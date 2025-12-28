🧠 Project Objective

Build a collection of interactive web-based games using React (frontend) and Node.js (backend) with clean architecture, real-time support, and scalable design.

🏗️ Tech Stack

Frontend: React + Vite

Backend: Node.js + Express

Real-Time: Socket.IO

State Mgmt: React Context / Zustand

Styling: Tailwind CSS

Linting: ESLint + Prettier

📁 Project Structure (Initial)
/game-platform
│
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── game/
│   │   ├── games/
│   │   │   ├── tic-tac-toe/
│   │   │   ├── quiz/
│   │   │   ├── memory/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
├── server/                     # Node.js Backend
│   ├── src/
│   │   ├── games/
│   │   │   ├── ticTacToe.logic.js
│   │   │   ├── quiz.logic.js
│   │   ├── socket/
│   │   │   ├── game.socket.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   └── server.js
│
├── shared/                     # Shared types/constants
│   ├── gameConstants.js
│
└── README.md

🎮 Game Design Principles (For Copilot)

Each game must be self-contained

Business logic lives on the server

UI is stateless where possible

Multiplayer uses Socket.IO rooms

No direct client trust for scoring

🔌 Backend Responsibilities

Create and manage game rooms

Validate player moves

Broadcast game state updates

Maintain in-memory game state (no DB initially)

🎨 Frontend Responsibilities

Render game UI

Send player actions to server

React to server events

Show game status (waiting, playing, finished)

🔄 Sample Socket Events
client -> server:
JOIN_GAME
MAKE_MOVE
SUBMIT_ANSWER

server -> client:
GAME_STATE_UPDATE
PLAYER_JOINED
GAME_OVER
ERROR

🤖 Copilot Agent Instructions

Use incremental development:

Scaffold folder structure

Create basic Express + Socket.IO server

Implement one game fully (Tic-Tac-Toe)

Extract reusable patterns

Replicate for remaining games

Prefer:

Small reusable functions

Clear naming

Inline comments for game logic

Type-safe patterns where possible

🚀 Phase-Wise Implementation Plan

Phase 1

Project setup

Basic multiplayer Tic-Tac-Toe

Phase 2

Shared game engine utilities

Add Quiz game

Phase 3

UI polish

Leaderboards

Sound & animations