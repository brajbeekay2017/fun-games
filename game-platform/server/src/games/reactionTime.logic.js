import { BaseGame } from './BaseGame.js';
import { REACTION_TIME_CONFIG } from '../../../shared/gameConstants.js';

/**
 * Reaction Time Challenge Game Logic
 * Players click as fast as possible when screen changes color
 */
export class ReactionTimeGame extends BaseGame {
  constructor(roomId, players = [], gameMode = 'multiplayer') {
    super(roomId, players, gameMode);
    this.gameType = 'reaction-time';
    this.rounds = [];
    this.currentRound = null;
    this.roundIndex = 0;
    this.maxRounds = 5;
    this.playerResponses = new Map(); // { playerId: { reactionTime, correct } }
    this.startTime = null;
    this.colorChangeTime = null;
  }

  /**
   * Start a new round
   * @returns {Object} Round data
   */
  startRound() {
    if (this.roundIndex >= this.maxRounds) {
      this.endGame();
      return null;
    }

    // Random delay between 1-5 seconds
    const delay = Math.random() 
      * (REACTION_TIME_CONFIG.MAX_DELAY - REACTION_TIME_CONFIG.MIN_DELAY) 
      + REACTION_TIME_CONFIG.MIN_DELAY;

    this.currentRound = {
      roundNumber: this.roundIndex + 1,
      delay: Math.round(delay),
      colorChangeTime: null,
      responses: new Map(),
      startTime: Date.now(),
    };

    this.roundIndex++;
    this.status = 'playing';

    return {
      roundNumber: this.currentRound.roundNumber,
      delay: this.currentRound.delay,
      message: 'Wait for the color to change...',
    };
  }

  /**
   * Signal that color has changed
   * Server calls this when it's time to show color
   */
  triggerColorChange() {
    if (!this.currentRound) return;

    this.currentRound.colorChangeTime = Date.now();
    this.colorChangeTime = this.currentRound.colorChangeTime;

    return {
      colorChangeTime: this.currentRound.colorChangeTime,
      roundNumber: this.currentRound.roundNumber,
    };
  }

  /**
   * Handle player click/response
   * @param {string} playerId - Player who clicked
   * @returns {Object} Result with reaction time and validity
   */
  handlePlayerResponse(playerId) {
    if (!this.currentRound) {
      return {
        success: false,
        error: 'No active round',
      };
    }

    if (!this.isValidPlayer(playerId)) {
      return {
        success: false,
        error: 'Invalid player',
      };
    }

    const clickTime = Date.now();

    // If color hasn't changed yet (false start)
    if (!this.currentRound.colorChangeTime) {
      return {
        success: false,
        reactionTime: clickTime - this.currentRound.startTime,
        correct: false,
        message: 'Too fast! False start.',
      };
    }

    const reactionTime = clickTime - this.currentRound.colorChangeTime;

    // Check if reaction time is valid
    const isValid = reactionTime >= REACTION_TIME_CONFIG.MIN_REACTION 
      && reactionTime <= REACTION_TIME_CONFIG.MAX_REACTION;

    if (!isValid) {
      return {
        success: false,
        reactionTime,
        correct: false,
        message: 'Too slow!',
      };
    }

    // Valid response - record it
    this.currentRound.responses.set(playerId, {
      reactionTime,
      clickTime,
    });

    // Update score (lower reaction time = higher score)
    const score = Math.max(0, 1000 - reactionTime);
    this.updateScore(playerId, Math.round(score));

    return {
      success: true,
      reactionTime,
      correct: true,
      score: Math.round(score),
      message: `Great! ${reactionTime}ms`,
    };
  }

  /**
   * End current round and prepare for next
   * @returns {Object} Round summary
   */
  endRound() {
    if (!this.currentRound) return null;

    const roundSummary = {
      roundNumber: this.currentRound.roundNumber,
      responses: Array.from(this.currentRound.responses.entries()).map(
        ([playerId, data]) => ({
          playerId,
          reactionTime: data.reactionTime,
        })
      ),
      leaderboard: this.getLeaderboard(),
    };

    this.rounds.push(this.currentRound);
    this.currentRound = null;

    return roundSummary;
  }

  /**
   * End the entire game
   */
  endGame() {
    this.status = 'finished';
    this.gameOver = true;
  }

  /**
   * Get current game state
   * @returns {Object}
   */
  getState() {
    return {
      roomId: this.roomId,
      gameType: this.gameType,
      gameMode: this.gameMode,
      status: this.status,
      currentRound: this.currentRound ? {
        roundNumber: this.currentRound.roundNumber,
        delay: this.currentRound.delay,
      } : null,
      roundIndex: this.roundIndex,
      maxRounds: this.maxRounds,
      players: this.players,
      scores: Object.fromEntries(this.scores),
      leaderboard: this.getLeaderboard(),
      gameOver: this.gameOver,
    };
  }

  /**
   * Get final results with complete history
   * @returns {Object}
   */
  getResults() {
    return {
      roomId: this.roomId,
      gameMode: this.gameMode,
      totalRounds: this.rounds.length,
      leaderboard: this.getLeaderboard(),
      roundDetails: this.rounds.map(round => ({
        roundNumber: round.roundNumber,
        responses: Array.from(round.responses.entries()).map(
          ([playerId, data]) => ({
            playerId,
            reactionTime: data.reactionTime,
          })
        ),
      })),
      playerStats: this.getPlayerStats(),
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate detailed player statistics
   * @returns {Object}
   */
  getPlayerStats() {
    const stats = {};

    this.players.forEach(playerId => {
      const playerReactionTimes = [];
      
      this.rounds.forEach(round => {
        if (round.responses.has(playerId)) {
          playerReactionTimes.push(round.responses.get(playerId).reactionTime);
        }
      });

      stats[playerId] = {
        count: playerReactionTimes.length,
        average: playerReactionTimes.length > 0
          ? Math.round(playerReactionTimes.reduce((a, b) => a + b, 0) / playerReactionTimes.length)
          : 0,
        best: playerReactionTimes.length > 0 ? Math.min(...playerReactionTimes) : 0,
        worst: playerReactionTimes.length > 0 ? Math.max(...playerReactionTimes) : 0,
        score: this.scores.get(playerId) || 0,
      };
    });

    return stats;
  }

  /**
   * Handle action dispatch
   * @param {string} playerId - Player ID
   * @param {Object} data - Action data
   * @returns {Object} Result
   */
  handleAction(playerId, data) {
    const { action, payload } = data;

    switch (action) {
      case 'RESPOND':
        return this.handlePlayerResponse(playerId);
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }
}