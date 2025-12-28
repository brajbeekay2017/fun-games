import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import app from './src/app.js';
import setupGameSocket from './src/socket/game.socket.js';

// Load environment variables
dotenv.config();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Setup Socket.IO event handlers
setupGameSocket(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🎮 Game Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default io;