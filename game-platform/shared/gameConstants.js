/**
 * Shared game constants used by both client and server
 */

export const GAME_TYPES = {
  TIC_TAC_TOE: 'tic-tac-toe',
  QUIZ: 'quiz',
  MEMORY: 'memory',
};

export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
  ERROR: 'error',
};

export const GAME_MODES = {
  SINGLE_PLAYER: 'single-player',
  MULTIPLAYER: 'multiplayer',
};

export const SOCKET_EVENTS = {
  // Connection lifecycle
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Client -> Server
  JOIN_GAME: 'JOIN_GAME',
  MAKE_MOVE: 'MAKE_MOVE',
  LEAVE_GAME: 'LEAVE_GAME',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',

  // Server -> Client
  GAME_STATE_UPDATE: 'GAME_STATE_UPDATE',
  PLAYER_JOINED: 'PLAYER_JOINED',
  GAME_OVER: 'GAME_OVER',
  ERROR: 'ERROR',
};

// Tic-Tac-Toe specific
export const BOARD_SIZE = 3;
export const EMPTY_CELL = null;