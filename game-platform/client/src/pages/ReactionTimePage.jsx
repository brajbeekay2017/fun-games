import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { SOCKET_EVENTS, COLORS } from '../../../shared/gameConstants';
import ReactionTimeGame from '../games/reaction-time/ReactionTimeGame';

function ReactionTimePage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get('mode') || 'multiplayer';
  const navigate = useNavigate();
  const socket = useSocket();
  const { gameState, setGameState, error, setError, clearError } = useGameStore();

  const playerIdRef = useRef(`player-${Date.now()}`);
  const hasJoinedRef = useRef(false);
  const socketReadyRef = useRef(false);

  useEffect(() => {
    if (socket) {
      console.log(`📌 ReactionTimePage: Socket is ready`, socket.id);
      socketReadyRef.current = true;
    } else {
      socketReadyRef.current = false;
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      console.log(`⏳ ReactionTimePage: Socket not ready yet`);
      return;
    }

    if (hasJoinedRef.current) {
      console.log(`ℹ️ ReactionTimePage: Already joined`);
      return;
    }

    const playerId = playerIdRef.current;
    console.log(`📍 ReactionTimePage: Joining game`, {
      roomId,
      playerId,
      gameMode,
      gameType: 'reaction-time',
    });

    hasJoinedRef.current = true;

    const handleGameStateUpdate = (state) => {
      console.log(`📊 ReactionTimePage: Received GAME_STATE_UPDATE:`, state);
      setGameState(state);
      clearError();
    };

    const handlePlayerJoined = (data) => {
      console.log(`👥 ReactionTimePage: PLAYER_JOINED:`, data);
    };

    const handleGameOver = (data) => {
      console.log(`🏁 ReactionTimePage: GAME_OVER:`, data);
    };

    const handleError = (errorMsg) => {
      console.error(`❌ ReactionTimePage: ERROR:`, errorMsg);
      setError(errorMsg);
    };

    socket.on(SOCKET_EVENTS.GAME_STATE_UPDATE, handleGameStateUpdate);
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
    socket.on(SOCKET_EVENTS.GAME_OVER, handleGameOver);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    console.log(`📤 ReactionTimePage: Emitting JOIN_GAME`);
    socket.emit(SOCKET_EVENTS.JOIN_GAME, {
      roomId,
      playerId,
      gameType: 'reaction-time',
      gameMode,
    });

    return () => {
      console.log(`🧹 ReactionTimePage: Removing listeners`);
      socket.off(SOCKET_EVENTS.GAME_STATE_UPDATE, handleGameStateUpdate);
      socket.off(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
      socket.off(SOCKET_EVENTS.GAME_OVER, handleGameOver);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      socket.emit(SOCKET_EVENTS.LEAVE_GAME);
      hasJoinedRef.current = false;
    };
  }, [socket, roomId, gameMode, setGameState, setError, clearError]);

  const handlePlayerResponse = () => {
    if (!socket) {
      console.error(`❌ Socket not connected`);
      return;
    }

    console.log(`📤 ReactionTimePage: Sending SUBMIT_REACTION_TIME`);
    socket.emit(SOCKET_EVENTS.SUBMIT_REACTION_TIME, {
      roomId,
      playerId: playerIdRef.current,
    });
  };

  return (
    <ReactionTimeGame
      gameState={gameState}
      playerId={playerIdRef.current}
      onResponse={handlePlayerResponse}
      error={error}
      gameMode={gameMode}
      socket={socket}
    />
  );
}

export default ReactionTimePage;