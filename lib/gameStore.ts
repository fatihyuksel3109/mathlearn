import { create } from 'zustand';

interface GameState {
  correct: number;
  wrong: number;
  reset: () => void;
  incrementCorrect: () => void;
  incrementWrong: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  correct: 0,
  wrong: 0,
  reset: () => set({ correct: 0, wrong: 0 }),
  incrementCorrect: () => set((state) => ({ correct: state.correct + 1 })),
  incrementWrong: () => set((state) => ({ wrong: state.wrong + 1 })),
}));

