import { create } from 'zustand';

/**
 * Global game state management using Zustand
 */
export const useGameStore = create((set) => ({
  // State
  gameState: null,
  error: null,
  loading: false,

  // Actions
  setGameState: (state) => {
    console.log(`🔄 gameStore: setGameState`, state);
    return set({ gameState: state, error: null });
  },

  setError: (error) => {
    console.log(`🔴 gameStore: setError`, error);
    return set({ error });
  },

  setLoading: (loading) => {
    console.log(`⏳ gameStore: setLoading`, loading);
    return set({ loading });
  },

  clearError: () => {
    console.log(`✅ gameStore: clearError`);
    return set({ error: null });
  },

  reset: () => {
    console.log(`🔄 gameStore: reset`);
    return set({ gameState: null, error: null, loading: false });
  },
}));