import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { SOCKET_EVENTS } from '../../../shared/gameConstants';
import TicTacToeGame from '../games/tic-tac-toe/TicTacToeGame';

function TicTacToePage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get('mode') || 'multiplayer';
  const socket = useSocket();
  const { gameState, setGameState, error, setError, clearError } = useGameStore();
  
  const playerIdRef = useRef(`player-${Date.now()}`);
  const hasJoinedRef = useRef(false);
  const socketReadyRef = useRef(false);

  // Log socket status
  useEffect(() => {
    if (socket) {
      console.log(`📌 TicTacToePage: Socket is ready`, socket.id);
      socketReadyRef.current = true;
    } else {
      console.log(`⏳ TicTacToePage: Waiting for socket...`);
      socketReadyRef.current = false;
    }
  }, [socket]);

  // Join game when socket is ready
  useEffect(() => {
    if (!socket) {
      console.log(`⏳ TicTacToePage: Socket not ready yet`);
      return;
    }

    if (hasJoinedRef.current) {
      console.log(`ℹ️ TicTacToePage: Already joined`);
      return;
    }

    const playerId = playerIdRef.current;
    console.log(`📍 TicTacToePage: Joining game`, {
      roomId,
      playerId,
      gameMode,
      socketId: socket.id,
    });

    hasJoinedRef.current = true;

    // Register all listeners BEFORE emitting join
    const handleGameStateUpdate = (state) => {
      console.log(`📊 TicTacToePage: Received GAME_STATE_UPDATE:`, state);
      setGameState(state);
      clearError();
    };

    const handlePlayerJoined = (data) => {
      console.log(`👥 TicTacToePage: PLAYER_JOINED:`, data);
    };

    const handleGameOver = (data) => {
      console.log(`🏁 TicTacToePage: GAME_OVER:`, data);
    };

    const handleError = (errorMsg) => {
      console.error(`❌ TicTacToePage: ERROR:`, errorMsg);
      setError(errorMsg);
    };

    // Attach listeners
    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATE, handleGameStateUpdate);
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
    socket.on(SOCKET_EVENTS.GAME_OVER, handleGameOver);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    // NOW emit join
    console.log(`📤 TicTacToePage: Emitting JOIN_GAME`);
    socket.emit(SOCKET_EVENTS.JOIN_GAME, { roomId, playerId, gameMode });

    // Cleanup
    return () => {
      console.log(`🧹 TicTacToePage: Removing listeners`);
      socket.off(SOCKET_EVENTS.GAME_STATE_UPDATE, handleGameStateUpdate);
      socket.off(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
      socket.off(SOCKET_EVENTS.GAME_OVER, handleGameOver);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      socket.emit(SOCKET_EVENTS.LEAVE_GAME);
      hasJoinedRef.current = false;
    };
  }, [socket, roomId, gameMode, setGameState, setError, clearError]);

  const handleMove = (cellIndex) => {
    if (!socket) {
      console.error(`❌ Socket not connected`);
      return;
    }

    console.log(`📤 TicTacToePage: Sending MAKE_MOVE`, { cellIndex });
    socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      roomId,
      playerId: playerIdRef.current,
      cellIndex,
    });
  };

  return (
    <TicTacToeGame
      gameState={gameState}
      playerId={playerIdRef.current}
      onMove={handleMove}
      error={error}
      gameMode={gameMode}
    />
  );
}

export default TicTacToePage;