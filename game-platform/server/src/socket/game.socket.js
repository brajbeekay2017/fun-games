import { TicTacToeGame } from '../games/ticTacToe.logic.js';
import { SOCKET_EVENTS } from '../../../shared/gameConstants.js';

const gameRooms = new Map();
const playerSockets = new Map();

export default function setupGameSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Player connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_GAME, (data) => {
      const { roomId, playerId, gameMode = 'multiplayer' } = data;

      console.log(`📍 JOIN_GAME - Room: ${roomId}, Player: ${playerId}, Mode: ${gameMode}`);

      try {
        // Create room if doesn't exist
        if (!gameRooms.has(roomId)) {
          console.log(`🏠 Creating new game room: ${roomId}`);
          
          let game;
          if (gameMode === 'single-player') {
            game = new TicTacToeGame(roomId, [playerId, 'COMPUTER'], gameMode);
            console.log(`🤖 Single-player game created with players:`, game.players);
          } else {
            game = new TicTacToeGame(roomId, [], gameMode);
            console.log(`👥 Multiplayer game created (waiting for players)`);
          }
          
          gameRooms.set(roomId, game);
        }

        const game = gameRooms.get(roomId);
        console.log(`📊 Current game state:`, {
          roomId: game.roomId,
          players: game.players,
          gameMode: game.gameMode,
          board: game.board
        });

        // For multiplayer, check room capacity
        if (gameMode === 'multiplayer' && game.players.length >= 2) {
          console.log(`❌ Room full - rejecting player`);
          socket.emit(SOCKET_EVENTS.ERROR, 'Room is full');
          return;
        }

        // Add player if not already present
        if (!game.players.includes(playerId)) {
          game.players.push(playerId);
          console.log(`✅ Player added. Total players:`, game.players);
        } else {
          console.log(`ℹ️ Player already in room`);
        }

        // Store socket reference
        playerSockets.set(playerId, socket);

        // Join socket to room
        socket.join(roomId);
        socket.data.playerId = playerId;
        socket.data.roomId = roomId;

        // Get game state
        const gameState = game.getState();
        console.log(`📤 Emitting GAME_STATE_UPDATE to player ${playerId}:`, gameState);

        // CRITICAL: Emit to the specific socket first
        socket.emit(SOCKET_EVENTS.GAME_STATE_UPDATE, gameState);

        // Then broadcast to entire room
        io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, gameState);

        // Notify about game start
        if (gameMode === 'single-player') {
          console.log(`🎮 Game started immediately (single-player)`);
          io.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
            message: 'Game started!',
          });
        } else if (game.players.length === 2) {
          console.log(`🎮 Game started (both players joined)`);
          io.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
            message: 'Both players joined. Game starting...',
          });
        }
      } catch (error) {
        console.error(`❌ Error in JOIN_GAME:`, error.message, error.stack);
        socket.emit(SOCKET_EVENTS.ERROR, `Failed to join game: ${error.message}`);
      }
    });

    socket.on(SOCKET_EVENTS.MAKE_MOVE, (data) => {
      const { roomId, playerId, cellIndex } = data;

      console.log(
        `🎮 MAKE_MOVE - Room: ${roomId}, Player: ${playerId}, Cell: ${cellIndex}`
      );

      try {
        const game = gameRooms.get(roomId);

        if (!game) {
          console.error(`❌ Room ${roomId} not found`);
          socket.emit(SOCKET_EVENTS.ERROR, 'Game room not found');
          return;
        }

        // Make the move
        const moveResult = game.makeMove(playerId, cellIndex);

        if (!moveResult.success) {
          console.log(`⚠️ Invalid move: ${moveResult.error}`);
          socket.emit(SOCKET_EVENTS.ERROR, moveResult.error);
          return;
        }

        console.log(`✅ Move accepted`);

        // Broadcast new state
        const newState = game.getState();
        console.log(`📤 Broadcasting GAME_STATE_UPDATE to room ${roomId}`);
        io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, newState);

        // Handle game over
        if (moveResult.gameOver) {
          console.log(
            `🏁 GAME OVER - Winner: ${moveResult.winner || 'Draw'}`
          );
          io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
            winner: moveResult.winner,
            isDraw: moveResult.isDraw || false,
          });

          // Cleanup after 5 seconds
          setTimeout(() => {
            gameRooms.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted`);
          }, 5000);
          return;
        }

        // Handle computer move
        if (moveResult.shouldComputerMove) {
          console.log(`🤖 Computer will move in 1 second...`);
          
          setTimeout(() => {
            const computerResult = game.computerMove();

            if (computerResult.success) {
              const computerState = game.getState();
              console.log(`📤 Broadcasting computer move state`);
              io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, computerState);

              if (computerResult.gameOver) {
                console.log(
                  `🏁 GAME OVER - Computer won or draw`
                );
                io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
                  winner: computerResult.winner,
                  isDraw: computerResult.isDraw || false,
                });

                setTimeout(() => {
                  gameRooms.delete(roomId);
                  console.log(`🗑️ Room ${roomId} deleted`);
                }, 5000);
              }
            }
          }, 1000);
        }
      } catch (error) {
        console.error(`❌ Error in MAKE_MOVE:`, error.message, error.stack);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to make move');
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_GAME, () => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (roomId) {
        console.log(`👋 Player ${playerId} leaving room ${roomId}`);
        socket.leave(roomId);
        io.to(roomId).emit(SOCKET_EVENTS.ERROR, 'Opponent left the game');
        playerSockets.delete(playerId);
      }
    });

    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      console.log(`❌ Disconnect - Player: ${playerId}, Room: ${roomId}`);

      if (roomId) {
        io.to(roomId).emit(SOCKET_EVENTS.ERROR, 'Opponent disconnected');
      }

      if (playerId) {
        playerSockets.delete(playerId);
      }
    });
  });
}