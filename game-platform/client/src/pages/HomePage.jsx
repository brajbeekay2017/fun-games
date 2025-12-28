import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handlePlayComputer = () => {
    const newRoomId = `room-single-${Date.now()}`;
    navigate(`/game/tic-tac-toe/${newRoomId}?mode=single-player`);
  };

  const handleCreateMultiplayer = () => {
    const newRoomId = `room-multi-${Date.now()}`;
    navigate(`/game/tic-tac-toe/${newRoomId}?mode=multiplayer`);
  };

  const handleJoinGame = () => {
    if (roomId.trim()) {
      navigate(`/game/tic-tac-toe/${roomId}?mode=multiplayer`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-white mb-12">🎮 Game Platform</h1>

      <div className="bg-white rounded-lg shadow-2xl p-8 w-96">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Tic-Tac-Toe
        </h2>

        <button
          onClick={handlePlayComputer}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg mb-4 hover:shadow-lg transition"
        >
          🤖 Play vs Computer
        </button>

        <button
          onClick={handleCreateMultiplayer}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-lg mb-4 hover:shadow-lg transition"
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
          onClick={handleJoinGame}
          disabled={!roomId.trim()}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Multiplayer
        </button>
      </div>
    </div>
  );
}

export default HomePage;