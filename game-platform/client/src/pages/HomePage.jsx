import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available games from server
    fetchAvailableGames();
  }, []);

  const fetchAvailableGames = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      // Fallback to static games
      setGames([
        {
          id: 'tic-tac-toe',
          name: 'Tic-Tac-Toe',
          icon: '⭕',
          description: 'Classic 3x3 grid game',
          modes: ['single-player', 'multiplayer'],
        },
        {
          id: 'reaction-time',
          name: 'Reaction Time',
          icon: '⚡',
          description: 'Test your reflexes!',
          modes: ['single-player', 'multiplayer'],
        },
        {
          id: 'quiz',
          name: 'Quiz',
          icon: '❓',
          description: 'Answer trivia questions',
          modes: ['single-player', 'multiplayer'],
          coming_soon: true,
        },
        {
          id: 'memory',
          name: 'Memory',
          icon: '🧠',
          description: 'Match the cards',
          modes: ['single-player'],
          coming_soon: true,
        },
      ]);
    }
  };

  const handlePlayComputer = (gameId) => {
    const newRoomId = `room-single-${Date.now()}`;
    navigate(`/game/${gameId}/${newRoomId}?mode=single-player`);
  };

  const handleCreateMultiplayer = (gameId) => {
    const newRoomId = `room-multi-${Date.now()}`;
    navigate(`/game/${gameId}/${newRoomId}?mode=multiplayer`);
  };

  const handleJoinGame = (gameId) => {
    if (roomId.trim()) {
      navigate(`/game/${gameId}/${roomId}?mode=multiplayer`);
    }
  };

  // Game Selection View
  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">🎮 Game Platform</h1>
            <p className="text-xl text-gray-300">Choose a game to play</p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => !game.coming_soon && setSelectedGame(game)}
                className={`
                  rounded-lg shadow-lg p-6 text-center cursor-pointer transition
                  ${game.coming_soon
                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-2xl hover:scale-105'
                  }
                `}
              >
                <div className="text-5xl mb-4">{game.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{game.description}</p>
                
                {game.coming_soon && (
                  <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full inline-block">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">🏆 Global Leaderboard</h2>
            <p className="text-gray-300">Coming soon - Compare your scores with other players!</p>
          </div>
        </div>
      </div>
    );
  }

  // Game Mode Selection View
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <button
        onClick={() => setSelectedGame(null)}
        className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
      >
        ← Back
      </button>

      <h1 className="text-6xl font-bold text-white mb-2">{selectedGame.icon} {selectedGame.name}</h1>
      <p className="text-gray-300 mb-12">{selectedGame.description}</p>

      <div className="bg-white rounded-lg shadow-2xl p-8 w-96">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          How do you want to play?
        </h2>

        <button
          onClick={() => handlePlayComputer(selectedGame.id)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg mb-4 hover:shadow-lg transition cursor-pointer"
        >
          🤖 Play vs Computer
        </button>

        <button
          onClick={() => handleCreateMultiplayer(selectedGame.id)}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-lg mb-4 hover:shadow-lg transition cursor-pointer"
        >
          👥 Create Multiplayer Game
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or join existing</span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={() => handleJoinGame(selectedGame.id)}
          disabled={!roomId.trim()}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Join Multiplayer
        </button>
      </div>
    </div>
  );
}

export default HomePage;