import { TicTacToeGame } from './ticTacToe.logic.js';
import { ReactionTimeGame } from './reactionTime.logic.js';
import { GAME_TYPES } from '../../../shared/gameConstants.js';

/**
 * Factory for creating game instances based on game type
 */
export class GameFactory {
  /**
   * Create a game instance
   * @param {string} gameType - Type of game
   * @param {string} roomId - Room ID
   * @param {Array} players - Player list
   * @param {string} gameMode - Game mode
   * @returns {BaseGame} Game instance
   */
  static createGame(gameType, roomId, players = [], gameMode = 'multiplayer') {
    switch (gameType) {
      case GAME_TYPES.TIC_TAC_TOE:
        return new TicTacToeGame(roomId, players, gameMode);

      case GAME_TYPES.REACTION_TIME:
        return new ReactionTimeGame(roomId, players, gameMode);

      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }

  /**
   * Get all available game types
   * @returns {Array}
   */
  static getAvailableGames() {
    return [
      {
        id: GAME_TYPES.TIC_TAC_TOE,
        name: 'Tic-Tac-Toe',
        icon: '⭕',
        description: 'Classic 3x3 grid game',
        modes: ['single-player', 'multiplayer'],
      },
      {
        id: GAME_TYPES.REACTION_TIME,
        name: 'Reaction Time',
        icon: '⚡',
        description: 'Test your reflexes!',
        modes: ['single-player', 'multiplayer'],
      },
      {
        id: GAME_TYPES.QUIZ,
        name: 'Quiz',
        icon: '❓',
        description: 'Answer trivia questions',
        modes: ['single-player', 'multiplayer'],
        coming_soon: true,
      },
      {
        id: GAME_TYPES.MEMORY,
        name: 'Memory',
        icon: '🧠',
        description: 'Match the cards',
        modes: ['single-player'],
        coming_soon: true,
      },
    ];
  }

  /**
   * Validate game type
   * @param {string} gameType - Game type to validate
   * @returns {boolean}
   */
  static isValidGameType(gameType) {
    return Object.values(GAME_TYPES).includes(gameType);
  }
}