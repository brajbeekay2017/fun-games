import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TicTacToePage from './pages/TicTacToePage';
import ReactionTimePage from './pages/ReactionTimePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Tic-Tac-Toe Routes */}
          <Route path="/game/tic-tac-toe/:roomId" element={<TicTacToePage />} />
          
          {/* Reaction Time Routes */}
          <Route path="/game/reaction-time/:roomId" element={<ReactionTimePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;