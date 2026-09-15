import { create } from 'zustand';
import { StreakState } from '../models';
import { streakService, streakBonus } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface StreakStoreState {
  streak: StreakState | null;
  justAdvanced: boolean;
  load: () => Promise<void>;
  recordToday: () => Promise<{ advanced: boolean; bonus: number }>;
  clearJustAdvanced: () => void;
}

export const useStreakStore = create<StreakStoreState>((set) => ({
  streak: null,
  justAdvanced: false,

  load: async () => {
    const streak = await streakService.getStreak(CURRENT_USER_ID);
    set({ streak });
  },

  recordToday: async () => {
    const { state, advanced } = await streakService.recordActivity(CURRENT_USER_ID);
    set({ streak: state, justAdvanced: advanced });
    return { advanced, bonus: advanced ? streakBonus(state.currentStreak) : 0 };
  },

  clearJustAdvanced: () => set({ justAdvanced: false }),
}));
