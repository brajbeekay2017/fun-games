/**
 * Shared game constants used by both client and server
 */

export const GAME_TYPES = {
  TIC_TAC_TOE: 'tic-tac-toe',
  REACTION_TIME: 'reaction-time',
  QUIZ: 'quiz',
  MEMORY: 'memory',
  SNAKE: 'snake',
};

export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
  ERROR: 'error',
  COUNTDOWN: 'countdown',
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
  SUBMIT_REACTION_TIME: 'SUBMIT_REACTION_TIME',
  START_GAME: 'START_GAME',

  // Server -> Client
  GAME_STATE_UPDATE: 'GAME_STATE_UPDATE',
  GAME_STARTED: 'GAME_STARTED',
  PLAYER_JOINED: 'PLAYER_JOINED',
  GAME_OVER: 'GAME_OVER',
  COLOR_CHANGE: 'COLOR_CHANGE',
  LEADERBOARD_UPDATE: 'LEADERBOARD_UPDATE',
  ERROR: 'ERROR',
};

// Tic-Tac-Toe specific
export const BOARD_SIZE = 3;
export const EMPTY_CELL = null;

// Reaction Time Challenge specific
export const REACTION_TIME_CONFIG = {
  MIN_DELAY: 1000,      // Minimum 1 second
  MAX_DELAY: 5000,      // Maximum 5 seconds
  GAME_DURATION: 30000, // 30 seconds total
  ROUND_DURATION: 5000, // 5 seconds per round
  MIN_REACTION: 100,    // Too fast = false start
  MAX_REACTION: 10000,  // Too slow = timeout
};

export const COLORS = {
  DEFAULT: '#1F2937',     // Gray
  ACTIVE: '#10B981',      // Green
  WRONG: '#EF4444',       // Red
};