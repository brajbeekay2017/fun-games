import { BOARD_SIZE, EMPTY_CELL } from '../../../shared/gameConstants.js';

/**
 * Tic-Tac-Toe game logic class
 * Manages game state and move validation
 * Supports both single-player (vs computer) and multiplayer modes
 */
export class TicTacToeGame {
  constructor(roomId, players = [], gameMode = 'multiplayer') {
    this.roomId = roomId;
    this.players = players; // [playerId1, playerId2 or 'COMPUTER']
    this.gameMode = gameMode; // 'single-player' or 'multiplayer'
    this.board = Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY_CELL);
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.moves = [];
    this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
  }

  /**
   * Makes a move on the board
   * @param {string} playerId - Player making the move
   * @param {number} cellIndex - Board cell index (0-8)
   * @returns {Object} Result of the move
   */
  makeMove(playerId, cellIndex) {
    // Validate cell index
    if (cellIndex < 0 || cellIndex >= 9) {
      return { success: false, error: 'Invalid cell index' };
    }

    // Validate cell is empty
    if (this.board[cellIndex] !== EMPTY_CELL) {
      return { success: false, error: 'Cell already occupied' };
    }

    // Validate it's the player's turn
    if (this.players[this.currentPlayerIndex] !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Make the move
    const symbol = this.currentPlayerIndex === 0 ? 'X' : 'O';
    this.board[cellIndex] = symbol;
    this.moves.push({ playerId, cellIndex, symbol });

    // Check for winner
    if (this.checkWinner()) {
      this.winner = playerId;
      return { success: true, gameOver: true, winner: this.winner };
    }

    // Check for draw (board full)
    if (this.board.every(cell => cell !== EMPTY_CELL)) {
      return { success: true, gameOver: true, winner: null, isDraw: true };
    }

    // Switch to next player
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;

    // Note: Computer move is NOW handled asynchronously in socket handler
    return { success: true, gameOver: false, shouldComputerMove: this.gameMode === 'single-player' && this.players[this.currentPlayerIndex] === 'COMPUTER' };
  }

  /**
   * Computer makes a move (called from socket handler with delay)
   * @returns {Object} Result of the computer move
   */
  computerMove() {
    const computerMoveIndex = this.getComputerMoveIndex();

    if (computerMoveIndex === -1) {
      return { success: true, gameOver: false };
    }

    // Make computer's move
    const symbol = 'O';
    this.board[computerMoveIndex] = symbol;
    this.moves.push({ playerId: 'COMPUTER', cellIndex: computerMoveIndex, symbol });

    // Check for winner
    if (this.checkWinner()) {
      this.winner = 'COMPUTER';
      return { success: true, gameOver: true, winner: this.winner, isComputerMove: true };
    }

    // Check for draw
    if (this.board.every(cell => cell !== EMPTY_CELL)) {
      return { success: true, gameOver: true, winner: null, isDraw: true, isComputerMove: true };
    }

    // Switch back to player
    this.currentPlayerIndex = 0;
    return { success: true, gameOver: false, isComputerMove: true };
  }

  /**
   * Determines the best move for the computer using minimax algorithm
   * @returns {number} Best cell index for computer to move
   */
  getComputerMoveIndex() {
    const availableCells = this.board
      .map((cell, index) => (cell === EMPTY_CELL ? index : null))
      .filter(index => index !== null);

    if (availableCells.length === 0) return -1;

    if (this.difficulty === 'easy') {
      return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    if (this.difficulty === 'medium') {
      return Math.random() > 0.5
        ? this.getBestMove()
        : availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    return this.getBestMove();
  }

  /**
   * Minimax algorithm to find best move
   * @returns {number} Best cell index
   */
  getBestMove() {
    let bestScore = -Infinity;
    let bestMove = 0;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === EMPTY_CELL) {
        this.board[i] = 'O';
        const score = this.minimax(0, false);
        this.board[i] = EMPTY_CELL;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }

  /**
   * Minimax recursive algorithm
   * @param {number} depth - Current depth in recursion
   * @param {boolean} isMaximizing - True if maximizing, false if minimizing
   * @returns {number} Score
   */
  minimax(depth, isMaximizing) {
    if (this.checkWinner()) {
      return isMaximizing ? -10 : 10;
    }

    if (this.board.every(cell => cell !== EMPTY_CELL)) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (this.board[i] === EMPTY_CELL) {
          this.board[i] = 'O';
          const score = this.minimax(depth + 1, false);
          this.board[i] = EMPTY_CELL;
          bestScore = Math.max(score - depth, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (this.board[i] === EMPTY_CELL) {
          this.board[i] = 'X';
          const score = this.minimax(depth + 1, true);
          this.board[i] = EMPTY_CELL;
          bestScore = Math.min(score + depth, bestScore);
        }
      }
      return bestScore;
    }
  }

  /**
   * Checks if current board state has a winner
   * @returns {boolean} True if there's a winner
   */
  checkWinner() {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of winPatterns) {
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets current game state
   * @returns {Object} Game state object
   */
  getState() {
    return {
      roomId: this.roomId,
      board: this.board,
      currentPlayer: this.players[this.currentPlayerIndex],
      players: this.players,
      winner: this.winner,
      isFull: this.board.every(cell => cell !== EMPTY_CELL),
      moveCount: this.moves.length,
      gameMode: this.gameMode,
    };
  }

  /**
   * Resets game for replay
   */
  reset() {
    this.board = Array(BOARD_SIZE * BOARD_SIZE).fill(EMPTY_CELL);
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.moves = [];
  }
}