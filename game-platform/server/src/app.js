import express from 'express';
import cors from 'cors';
import { GameFactory } from './games/gameFactory.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Get available games
app.get('/api/games', (req, res) => {
  const games = GameFactory.getAvailableGames();
  res.json(games);
});

// Get game info by type
app.get('/api/games/:gameType', (req, res) => {
  const { gameType } = req.params;
  const games = GameFactory.getAvailableGames();
  const game = games.find(g => g.id === gameType);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json(game);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;