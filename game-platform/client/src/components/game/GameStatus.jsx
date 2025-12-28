function GameStatus({ isCurrentPlayer, isWinner, isComputerWinner, isDraw, winner, gameMode }) {
  if (isWinner) {
    return (
      <div className="mt-8 text-center">
        <p className="text-5xl font-bold text-green-400 animate-bounce">🎉 You Won!</p>
      </div>
    );
  }

  if (isComputerWinner) {
    return (
      <div className="mt-8 text-center">
        <p className="text-5xl font-bold text-red-400">🤖 Computer Won!</p>
      </div>
    );
  }

  if (winner) {
    return (
      <div className="mt-8 text-center">
        <p className="text-5xl font-bold text-red-400">😢 Opponent Won!</p>
      </div>
    );
  }

  if (isDraw) {
    return (
      <div className="mt-8 text-center">
        <p className="text-5xl font-bold text-yellow-400">🤝 It's a Draw!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 text-center">
      <p className="text-xl text-white font-semibold">
        {isCurrentPlayer 
          ? '👉 Your Turn' 
          : gameMode === 'single-player' 
            ? '⏳ Computer is thinking...' 
            : '⏳ Opponent\'s Turn'}
      </p>
    </div>
  );
}

export default GameStatus;