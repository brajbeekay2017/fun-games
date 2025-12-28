import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from '../../components/game/Board';
import GameStatus from '../../components/game/GameStatus';

function TicTacToeGame({ gameState, playerId, onMove, error, gameMode }) {
  const navigate = useNavigate();
  const [isMoving, setIsMoving] = useState(false);

  const handleCellClick = async (cellIndex) => {
    if (isMoving) return;
    
    setIsMoving(true);
    onMove(cellIndex);
    
    // Reset moving flag after a short delay
    setTimeout(() => setIsMoving(false), 300);
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500 text-white p-8 rounded-lg text-center max-w-md">
          <p className="text-xl font-bold mb-4">⚠️ {error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-red-500 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Waiting for game state
  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-white text-2xl animate-pulse mb-4">
            {gameMode === 'single-player' ? '🤖 Loading game...' : '👥 Waiting for opponent...'}
          </div>
          <div className="text-gray-300 text-sm">
            <p>Room ID: {typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentPlayer = gameState.currentPlayer === playerId;
  const isWinner = gameState.winner === playerId;
  const isComputerWinner = gameState.winner === 'COMPUTER';
  const isDraw = gameState.isFull && !gameState.winner;
  const opponent = gameMode === 'single-player' ? '🤖 Computer' : '👤 Opponent';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <h1 className="text-5xl font-bold text-white mb-4">Tic-Tac-Toe</h1>
      
      <div className="mb-8 text-center">
        <p className="text-gray-300 mb-2">Room: <code className="bg-gray-800 px-2 py-1 rounded">{gameState.roomId}</code></p>
        <p className="text-gray-400 text-sm">
          {gameMode === 'single-player' ? '🎮 Single Player' : '👥 Multiplayer'}
        </p>
      </div>

      {/* Game Board */}
      <Board
        board={gameState.board}
        onCellClick={handleCellClick}
        disabled={!isCurrentPlayer || gameState.winner || isMoving}
      />

      {/* Player Info */}
      <div className="mt-8 text-center">
        <p className="text-white mb-4">
          {gameMode === 'single-player' ? (
            <>
              <span className="block mb-2 text-lg font-semibold">You: <span className="text-blue-400">X</span></span>
              <span className="block text-lg font-semibold">{opponent}: <span className="text-red-400">O</span></span>
            </>
          ) : (
            <>
              <span className="block mb-2 text-lg font-semibold">
                You: <span className={gameState.players[0] === playerId ? 'text-blue-400' : 'text-red-400'}>
                  {gameState.players[0] === playerId ? 'X' : 'O'}
                </span>
              </span>
              <span className="block text-lg font-semibold">
                {opponent}: <span className={gameState.players[0] === playerId ? 'text-red-400' : 'text-blue-400'}>
                  {gameState.players[0] === playerId ? 'O' : 'X'}
                </span>
              </span>
            </>
          )}
        </p>
      </div>

      {/* Game Status */}
      <GameStatus
        isCurrentPlayer={isCurrentPlayer}
        isWinner={isWinner}
        isComputerWinner={isComputerWinner}
        isDraw={isDraw}
        winner={gameState.winner}
        gameMode={gameMode}
      />

      {/* Move Counter */}
      <p className="text-gray-400 mt-8 text-sm">
        Moves: {gameState.moveCount} | Players: {gameState.players.length}/2
      </p>

      {/* Play Again Button */}
      {(gameState.winner || isDraw) && (
        <button
          onClick={handlePlayAgain}
          className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition duration-300"
        >
          Play Again
        </button>
      )}
    </div>
  );
}

export default TicTacToeGame;