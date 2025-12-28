import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Custom hook for Socket.IO connection management
 * @returns {Socket} Socket.IO client instance
 */
export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log(`🔌 useSocket: Attempting to connect to ${SOCKET_URL}`);

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log(`✅ useSocket: Connected with ID ${newSocket.id}`);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`❌ useSocket: Disconnected. Reason: ${reason}`);
      setSocket(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error(`⚠️ useSocket: Connection error:`, error);
    });

    newSocket.on('error', (error) => {
      console.error(`⚠️ useSocket: Socket error:`, error);
    });

    return () => {
      console.log(`🧹 useSocket: Cleaning up`);
      newSocket.disconnect();
    };
  }, []);

  return socket;
}