import { GameFactory } from '../games/gameFactory.js';
import { SOCKET_EVENTS, GAME_TYPES } from '../../../shared/gameConstants.js';

const gameRooms = new Map(); // roomId -> game instance
const playerSockets = new Map(); // playerId -> socket
const roomTimers = new Map(); // roomId -> { roundTimer, timeoutTimer }

export default function setupGameSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Player connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_GAME, (data) => {
      const { roomId, playerId, gameType = GAME_TYPES.TIC_TAC_TOE, gameMode = 'multiplayer' } = data;

      console.log(`📍 JOIN_GAME - Room: ${roomId}, Player: ${playerId}, Game: ${gameType}, Mode: ${gameMode}`);

      try {
        if (!GameFactory.isValidGameType(gameType)) {
          socket.emit(SOCKET_EVENTS.ERROR, `Invalid game type: ${gameType}`);
          return;
        }

        if (!gameRooms.has(roomId)) {
          console.log(`🏠 Creating new game room: ${roomId}, Game: ${gameType}`);
          
          let game;
          // ✅ FIX: Always create with both players, use 'COMPUTER' for single-player
          if (gameMode === 'single-player') {
            game = GameFactory.createGame(gameType, roomId, [playerId, 'COMPUTER'], gameMode);
            console.log(`🤖 Single-player mode: Player vs Computer`);
          } else {
            game = GameFactory.createGame(gameType, roomId, [], gameMode);
          }
          
          gameRooms.set(roomId, game);
        }

        const game = gameRooms.get(roomId);

        if (game.gameType !== gameType) {
          socket.emit(SOCKET_EVENTS.ERROR, 'Game type mismatch');
          return;
        }

        // For multiplayer, check room capacity
        if (gameMode === 'multiplayer' && game.players.length >= 2) {
          socket.emit(SOCKET_EVENTS.ERROR, 'Room is full');
          return;
        }

        // Only add player if not already present (avoid duplicates)
        if (!game.players.includes(playerId)) {
          game.players.push(playerId);
          game.scores.set(playerId, 0);
          console.log(`✅ Player added. Total players:`, game.players);
        }

        playerSockets.set(playerId, socket);
        socket.join(roomId);
        socket.data.playerId = playerId;
        socket.data.roomId = roomId;
        socket.data.gameType = gameType;

        const gameState = game.getState();
        console.log(`📤 Emitting GAME_STATE_UPDATE to player ${playerId}`);

        socket.emit(SOCKET_EVENTS.GAME_STATE_UPDATE, gameState);
        io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, gameState);

        if (gameMode === 'single-player') {
          console.log(`🎮 Game started immediately (single-player)`);
          io.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
            message: 'Game started! Playing against Computer...',
          });
          
          if (gameType === GAME_TYPES.REACTION_TIME) {
            setTimeout(() => {
              startReactionTimeRound(io, roomId, game);
            }, 1000);
          }
        } else if (game.players.length === 2) {
          console.log(`🎮 Game started (both players joined)`);
          io.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
            message: 'Both players joined. Game starting...',
          });

          if (gameType === GAME_TYPES.REACTION_TIME) {
            setTimeout(() => {
              startReactionTimeRound(io, roomId, game);
            }, 1000);
          }
        }
      } catch (error) {
        console.error(`❌ Error in JOIN_GAME:`, error.message);
        socket.emit(SOCKET_EVENTS.ERROR, `Failed to join game: ${error.message}`);
      }
    });

    socket.on(SOCKET_EVENTS.MAKE_MOVE, (data) => {
      handleGameAction(io, socket, data, SOCKET_EVENTS.MAKE_MOVE);
    });

    socket.on(SOCKET_EVENTS.SUBMIT_REACTION_TIME, (data) => {
      handleReactionTimeResponse(io, socket, data);
    });

    socket.on(SOCKET_EVENTS.LEAVE_GAME, () => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      if (roomId) {
        console.log(`👋 Player ${playerId} leaving room ${roomId}`);
        socket.leave(roomId);
        io.to(roomId).emit(SOCKET_EVENTS.ERROR, 'Opponent left the game');
        playerSockets.delete(playerId);
        clearRoomTimers(roomId);
      }
    });

    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;
      const roomId = socket.data.roomId;

      console.log(`❌ Disconnect - Player: ${playerId}, Room: ${roomId}`);

      if (roomId) {
        io.to(roomId).emit(SOCKET_EVENTS.ERROR, 'Opponent disconnected');
        clearRoomTimers(roomId);
      }

      if (playerId) {
        playerSockets.delete(playerId);
      }
    });
  });

  function clearRoomTimers(roomId) {
    const timers = roomTimers.get(roomId);
    if (timers) {
      if (timers.roundTimer) clearTimeout(timers.roundTimer);
      if (timers.timeoutTimer) clearTimeout(timers.timeoutTimer);
      roomTimers.delete(roomId);
      console.log(`🧹 Cleared timers for room ${roomId}`);
    }
  }

  /**
   * Handle generic game action (for Tic-Tac-Toe, etc)
   * ✅ FIXED: Uses fresh game reference instead of stale reference
   */
  function handleGameAction(io, socket, data, eventName) {
    const { roomId, playerId, cellIndex } = data;

    console.log(`🎮 MAKE_MOVE - Room: ${roomId}, Player: ${playerId}, Cell: ${cellIndex}`);

    try {
      const game = gameRooms.get(roomId);

      if (!game) {
        console.error(`❌ Game room ${roomId} not found`);
        socket.emit(SOCKET_EVENTS.ERROR, 'Game room not found');
        return;
      }

      const moveResult = game.makeMove(playerId, cellIndex);

      if (!moveResult.success) {
        console.error(`❌ Invalid move: ${moveResult.error}`);
        socket.emit(SOCKET_EVENTS.ERROR, moveResult.error);
        return;
      }

      const newState = game.getState();
      io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, newState);
      console.log(`📤 Broadcast GAME_STATE_UPDATE`);

      if (moveResult.gameOver) {
        console.log(`🏁 GAME OVER - Winner: ${moveResult.winner || 'Draw'}`);
        io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
          winner: moveResult.winner,
          isDraw: moveResult.isDraw || false,
        });

        clearRoomTimers(roomId);

        setTimeout(() => {
          gameRooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (game over)`);
        }, 5000);
        return;
      }

      // Handle computer move (Tic-Tac-Toe)
      if (moveResult.shouldComputerMove) {
        console.log(`🤖 Computer will move in 1 second...`);
        
        // ✅ FIX: Fetch fresh game reference instead of using closure variable
        setTimeout(() => {
          const currentGame = gameRooms.get(roomId);
          
          if (!currentGame) {
            console.warn(`⚠️ Game room ${roomId} was deleted before computer move`);
            return;
          }

          console.log(`🤖 Executing computer move...`);
          const computerResult = currentGame.computerMove();

          if (!computerResult.success) {
            console.error(`❌ Computer move failed:`, computerResult.error);
            return;
          }

          const computerState = currentGame.getState();
          io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, computerState);
          console.log(`📤 Broadcast GAME_STATE_UPDATE (computer move)`);

          if (computerResult.gameOver) {
            console.log(`🏁 GAME OVER - Winner: ${computerResult.winner || 'Draw'}`);
            io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
              winner: computerResult.winner,
              isDraw: computerResult.isDraw || false,
            });

            clearRoomTimers(roomId);

            setTimeout(() => {
              gameRooms.delete(roomId);
              console.log(`🗑️ Room ${roomId} deleted (computer game over)`);
            }, 5000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error(`❌ Error in MAKE_MOVE:`, error.message, error.stack);
      socket.emit(SOCKET_EVENTS.ERROR, 'Failed to make move');
    }
  }

  /**
   * Handle reaction time response
   */
  function handleReactionTimeResponse(io, socket, data) {
    const { roomId, playerId } = data;

    console.log(`⚡ SUBMIT_REACTION_TIME - Room: ${roomId}, Player: ${playerId}`);

    try {
      const game = gameRooms.get(roomId);

      if (!game) {
        socket.emit(SOCKET_EVENTS.ERROR, 'Game room not found');
        return;
      }

      const result = game.handlePlayerResponse(playerId);

      // Send result to individual player
      socket.emit('REACTION_RESULT', result);

      // Broadcast updated state
      const newState = game.getState();
      io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, newState);

      // Check if all players responded in this round
      if (game.currentRound && game.currentRound.responses.size === game.players.length) {
        console.log(`✅ All players responded to round ${game.currentRound.roundNumber}`);
        
        // Clear the timeout timer since all players responded
        const timers = roomTimers.get(roomId);
        if (timers && timers.timeoutTimer) {
          clearTimeout(timers.timeoutTimer);
          timers.timeoutTimer = null;
          console.log(`🧹 Cleared timeout timer for room ${roomId}`);
        }
        
        const roundSummary = game.endRound();
        io.to(roomId).emit('ROUND_SUMMARY', roundSummary);

        // Start next round
        if (game.roundIndex < game.maxRounds) {
          setTimeout(() => {
            startReactionTimeRound(io, roomId, game);
          }, 3000);
        } else {
          // Game over
          game.endGame();
          clearRoomTimers(roomId);
          
          io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
            results: game.getResults(),
          });

          setTimeout(() => {
            gameRooms.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted (game over)`);
          }, 5000);
        }
      }
    } catch (error) {
      console.error(`❌ Error in SUBMIT_REACTION_TIME:`, error.message);
      socket.emit(SOCKET_EVENTS.ERROR, 'Failed to submit reaction time');
    }
  }

  /**
   * Start a new reaction time round
   */
  function startReactionTimeRound(io, roomId, game) {
    console.log(`🎮 Starting reaction time round ${game.roundIndex + 1}`);

    const roundData = game.startRound();
    if (!roundData) {
      return; // Game over
    }

    // Broadcast round start
    io.to(roomId).emit('ROUND_START', {
      roundNumber: roundData.roundNumber,
      delay: roundData.delay,
      message: roundData.message,
    });

    // Trigger color change after delay
    const roundTimer = setTimeout(() => {
      console.log(`🟢 Color change triggered for round ${roundData.roundNumber}`);
      
      // Verify game still exists and round is still active
      const currentGame = gameRooms.get(roomId);
      if (!currentGame || !currentGame.currentRound) {
        console.log(`⚠️ Round was ended before color change for room ${roomId}`);
        return;
      }
      
      const colorData = currentGame.triggerColorChange();
      io.to(roomId).emit(SOCKET_EVENTS.COLOR_CHANGE, colorData);

      // Set timeout for round (5 seconds to respond)
      const timeoutTimer = setTimeout(() => {
        // Verify game still exists
        const timeoutGame = gameRooms.get(roomId);
        if (!timeoutGame) {
          console.log(`⚠️ Game room ${roomId} no longer exists`);
          return;
        }

        // Only process timeout if there's still an active round
        if (!timeoutGame.currentRound) {
          console.log(`⚠️ Round was already ended for room ${roomId}`);
          return;
        }

        console.log(`⏱️ Round ${timeoutGame.currentRound.roundNumber} timeout`);
        
        // Mark non-responding players
        timeoutGame.players.forEach(pid => {
          if (!timeoutGame.currentRound.responses.has(pid)) {
            timeoutGame.updateScore(pid, 0); // 0 points for timeout
          }
        });

        const roundSummary = timeoutGame.endRound();
        io.to(roomId).emit('ROUND_SUMMARY', roundSummary);

        // Start next round
        if (timeoutGame.roundIndex < timeoutGame.maxRounds) {
          setTimeout(() => {
            startReactionTimeRound(io, roomId, timeoutGame);
          }, 3000);
        } else {
          timeoutGame.endGame();
          clearRoomTimers(roomId);
          
          // 🔥 SEND GAME_OVER with full results
          io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
            results: timeoutGame.getResults(),
          });

          setTimeout(() => {
            gameRooms.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted (timeout game end)`);
          }, 5000);
        }
      }, 5000);

      // Store timers for this room
      roomTimers.set(roomId, { roundTimer, timeoutTimer });
    }, roundData.delay);
  }
}