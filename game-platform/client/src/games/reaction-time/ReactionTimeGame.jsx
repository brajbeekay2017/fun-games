import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOCKET_EVENTS, COLORS } from '../../../../shared/gameConstants';

function ReactionTimeGame({ gameState, playerId, onResponse, error, gameMode, socket }) {
  const navigate = useNavigate();
  const [screenColor, setScreenColor] = useState(COLORS.DEFAULT);
  const [roundActive, setRoundActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [roundResults, setRoundResults] = useState([]);
  const [waiting, setWaiting] = useState(true);
  const [finalResults, setFinalResults] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const hasClickedRef = useRef(false);
  const roundStartTimeRef = useRef(null);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoundStart = (data) => {
      console.log(`🎮 ROUND_START:`, data);
      setCurrentRound(data);
      setScreenColor(COLORS.DEFAULT);
      setReactionTime(null);
      hasClickedRef.current = false;
      setWaiting(true);
      setRoundActive(false);
    };

    const handleColorChange = (data) => {
      console.log(`🟢 COLOR_CHANGE:`, data);
      setScreenColor(COLORS.ACTIVE);
      roundStartTimeRef.current = Date.now();
      setRoundActive(true);
      setWaiting(false);
    };

    const handleReactionResult = (data) => {
      console.log(`⚡ REACTION_RESULT:`, data);
      setReactionTime(data.reactionTime);
      setScreenColor(data.correct ? COLORS.ACTIVE : COLORS.WRONG);
      setRoundActive(false);
    };

    const handleRoundSummary = (data) => {
      console.log(`📊 ROUND_SUMMARY:`, data);
      setRoundResults(prev => [...prev, data]);
      setScreenColor(COLORS.DEFAULT);
    };

    const handleGameOver = (data) => {
      console.log(`🏁 GAME_OVER received:`, data);
      setFinalResults(data.results);
      setShowGameOver(true);
    };

    socket.on('ROUND_START', handleRoundStart);
    socket.on(SOCKET_EVENTS.COLOR_CHANGE, handleColorChange);
    socket.on('REACTION_RESULT', handleReactionResult);
    socket.on('ROUND_SUMMARY', handleRoundSummary);
    socket.on(SOCKET_EVENTS.GAME_OVER, handleGameOver);

    return () => {
      socket.off('ROUND_START', handleRoundStart);
      socket.off(SOCKET_EVENTS.COLOR_CHANGE, handleColorChange);
      socket.off('REACTION_RESULT', handleReactionResult);
      socket.off('ROUND_SUMMARY', handleRoundSummary);
      socket.off(SOCKET_EVENTS.GAME_OVER, handleGameOver);
    };
  }, [socket]);

  const handleScreenClick = () => {
    if (!roundActive || hasClickedRef.current) return;

    hasClickedRef.current = true;
    onResponse();
  };

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

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-white text-2xl animate-pulse mb-4">
            ⚡ Loading game...
          </div>
        </div>
      </div>
    );
  }

  const leaderboard = gameState.leaderboard || [];
  const isGameFinished = gameState.status === 'finished' || gameState.gameOver;

  // Calculate player's personal reaction times from roundResults
  const playerReactionTimes = roundResults.flatMap(round => 
    round.responses
      .filter(response => response.playerId === playerId)
      .map(response => ({
        roundNumber: round.roundNumber,
        reactionTime: response.reactionTime,
      }))
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: screenColor }}>
      {/* Main Game Area */}
      <div
        onClick={handleScreenClick}
        className={`
          flex-1 w-full flex flex-col items-center justify-center cursor-pointer
          transition-all duration-100
          ${roundActive ? 'ring-4 ring-yellow-400' : ''}
        `}
      >
        <h1 className="text-5xl font-bold text-white mb-8 text-center">
          ⚡ Reaction Time Challenge
        </h1>

        {waiting && currentRound && (
          <div className="text-center">
            <p className="text-2xl text-white mb-4">Round {currentRound.roundNumber}/5</p>
            <p className="text-xl text-gray-300 animate-pulse">
              Wait for the color to change...
            </p>
          </div>
        )}

        {roundActive && !waiting && (
          <div className="text-center">
            <p className="text-6xl text-white font-bold animate-pulse">
              CLICK!
            </p>
            <p className="text-xl text-yellow-300 mt-4">
              Click as fast as you can!
            </p>
          </div>
        )}

        {reactionTime !== null && !roundActive && !isGameFinished && (
          <div className="text-center bg-black bg-opacity-50 p-8 rounded-lg">
            <p className="text-5xl font-bold text-white mb-2">
              {reactionTime}ms
            </p>
            <p className="text-xl text-gray-300">
              Reaction Time
            </p>
          </div>
        )}

        {isGameFinished && !showGameOver && (
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-300 animate-pulse mb-4">
              🎉 Game Finished!
            </p>
            <p className="text-xl text-gray-300">
              Calculating final results...
            </p>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-gray-900 bg-opacity-90 w-full px-8 py-6 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          {/* Current Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {leaderboard.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '#' + (idx + 1)}
                </p>
                <p className="text-white font-bold text-sm">
                  {entry.playerId === playerId ? 'You' : entry.playerId.substring(0, 8)}
                </p>
                <p className="text-yellow-400 font-bold">{entry.score}</p>
              </div>
            ))}
          </div>

          {/* Game Info */}
          <div className="flex justify-between items-center text-gray-300">
            <div>
              <p className="text-sm">Room: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{gameState.roomId}</code></p>
              <p className="text-sm mt-1">Mode: {gameMode === 'single-player' ? '🤖 Solo' : '👥 Multiplayer'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Round: {currentRound?.roundNumber || roundResults.length}/5</p>
              <p className={`text-sm mt-1 font-bold ${isGameFinished ? 'text-green-400' : 'text-blue-400'}`}>
                Status: {isGameFinished ? 'Finished ✓' : 'Playing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal - Enhanced */}
      {showGameOver && finalResults && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-8 border-b border-gray-700">
              <h2 className="text-5xl font-bold text-white mb-2">🎉 Game Complete!</h2>
              <p className="text-gray-200">Here's your performance summary</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Your Stats Summary */}
              <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">📊 Your Performance</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Average Reaction Time */}
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-1">Average</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {playerReactionTimes.length > 0
                        ? Math.round(playerReactionTimes.reduce((sum, r) => sum + r.reactionTime, 0) / playerReactionTimes.length)
                        : 0}
                    </p>
                    <p className="text-gray-500 text-xs">ms</p>
                  </div>

                  {/* Best Time */}
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-1">Best</p>
                    <p className="text-2xl font-bold text-green-400">
                      {playerReactionTimes.length > 0
                        ? Math.min(...playerReactionTimes.map(r => r.reactionTime))
                        : 0}
                    </p>
                    <p className="text-gray-500 text-xs">ms</p>
                  </div>

                  {/* Worst Time */}
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-1">Worst</p>
                    <p className="text-2xl font-bold text-red-400">
                      {playerReactionTimes.length > 0
                        ? Math.max(...playerReactionTimes.map(r => r.reactionTime))
                        : 0}
                    </p>
                    <p className="text-gray-500 text-xs">ms</p>
                  </div>

                  {/* Total Score */}
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-1">Score</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {leaderboard.find(e => e.playerId === playerId)?.score || 0}
                    </p>
                    <p className="text-gray-500 text-xs">points</p>
                  </div>
                </div>
              </div>

              {/* Reaction Times Table */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">⏱️ Reaction Times by Round</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-700 to-indigo-700">
                        <th className="border border-gray-700 px-6 py-3 text-left text-white font-semibold">Round</th>
                        <th className="border border-gray-700 px-6 py-3 text-center text-white font-semibold">Reaction Time</th>
                        <th className="border border-gray-700 px-6 py-3 text-center text-white font-semibold">Status</th>
                        <th className="border border-gray-700 px-6 py-3 text-right text-white font-semibold">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerReactionTimes.length > 0 ? (
                        playerReactionTimes.map((rt, idx) => {
                          const score = Math.max(0, 1000 - rt.reactionTime);
                          const isGood = rt.reactionTime < 300;
                          const isOk = rt.reactionTime < 500;
                          
                          return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                              <td className="border border-gray-700 px-6 py-3 text-white font-bold">
                                Round {rt.roundNumber}
                              </td>
                              <td className={`border border-gray-700 px-6 py-3 text-center font-bold text-lg ${
                                isGood ? 'text-green-400' : isOk ? 'text-yellow-400' : 'text-orange-400'
                              }`}>
                                {rt.reactionTime}ms
                              </td>
                              <td className="border border-gray-700 px-6 py-3 text-center">
                                {isGood && <span className="text-green-400 font-semibold">🚀 Excellent</span>}
                                {!isGood && isOk && <span className="text-yellow-400 font-semibold">⭐ Good</span>}
                                {!isGood && !isOk && <span className="text-orange-400 font-semibold">📌 Average</span>}
                              </td>
                              <td className="border border-gray-700 px-6 py-3 text-right text-yellow-400 font-bold">
                                {Math.round(score)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="border border-gray-700 px-6 py-4 text-center text-gray-400">
                            No reaction times recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Final Leaderboard */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">🏆 Final Leaderboard</h3>
                
                <div className="space-y-2">
                  {finalResults.leaderboard.map((entry, idx) => {
                    const isYou = entry.playerId === playerId;
                    const medals = ['🥇', '🥈', '🥉'];
                    const medal = idx < 3 ? medals[idx] : `#${idx + 1}`;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isYou
                            ? 'bg-gradient-to-r from-purple-700 to-indigo-700 border-purple-500'
                            : 'bg-gray-800 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{medal}</span>
                          <div>
                            <p className={`font-bold text-lg ${isYou ? 'text-yellow-300' : 'text-white'}`}>
                              {isYou ? '👤 You' : entry.playerId.substring(0, 12)}
                            </p>
                          </div>
                        </div>
                        <p className={`text-2xl font-bold ${isYou ? 'text-yellow-300' : 'text-yellow-400'}`}>
                          {entry.score}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition duration-300"
                >
                  🎮 Play Again
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition duration-300 border border-gray-600"
                >
                  🏠 Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReactionTimeGame;