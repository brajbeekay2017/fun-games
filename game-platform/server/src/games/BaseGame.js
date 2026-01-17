/**
 * Abstract base class for all games
 * Defines common interface and patterns
 */
export class BaseGame {
  constructor(roomId, players = [], gameMode = 'multiplayer') {
    this.roomId = roomId;
    this.players = players;
    this.gameMode = gameMode;
    this.status = 'waiting';
    this.createdAt = Date.now();
    this.scores = new Map();
    this.gameOver = false;
  }

  /**
   * Initialize players in the game
   * @param {Array} players - Player IDs
   */
  initializePlayers(players) {
    this.players = players;
    players.forEach(playerId => {
      this.scores.set(playerId, 0);
    });
  }

  /**
   * Validate if player can make a move
   * @param {string} playerId - Player ID
   * @returns {boolean}
   */
  isValidPlayer(playerId) {
    return this.players.includes(playerId);
  }

  /**
   * Get current game state
   * Should be implemented by child classes
   * @returns {Object}
   */
  getState() {
    throw new Error('getState() must be implemented by subclass');
  }

  /**
   * Handle player action
   * Should be implemented by child classes
   * @param {string} playerId - Player ID
   * @param {*} data - Action data
   * @returns {Object} Result
   */
  handleAction(playerId, data) {
    throw new Error('handleAction() must be implemented by subclass');
  }

  /**
   * Check if game is over
   * @returns {boolean}
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * Reset game for replay
   */
  reset() {
    this.status = 'waiting';
    this.gameOver = false;
    this.scores.clear();
    this.players.forEach(playerId => {
      this.scores.set(playerId, 0);
    });
  }

  /**
   * Get leaderboard for this game
   * @returns {Array}
   */
  getLeaderboard() {
    return Array.from(this.scores.entries())
      .map(([playerId, score]) => ({ playerId, score }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Update player score
   * @param {string} playerId - Player ID
   * @param {number} points - Points to add
   */
  updateScore(playerId, points) {
    if (this.scores.has(playerId)) {
      this.scores.set(playerId, this.scores.get(playerId) + points);
    }
  }

  /**
   * Get game metadata
   * @returns {Object}
   */
  getMetadata() {
    return {
      roomId: this.roomId,
      gameMode: this.gameMode,
      status: this.status,
      playerCount: this.players.length,
      createdAt: this.createdAt,
    };
  }
}