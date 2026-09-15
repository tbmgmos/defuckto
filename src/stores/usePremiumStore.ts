import { create } from 'zustand';
import { premiumService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  load: () => Promise<void>;
  activate: () => Promise<void>;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  isLoading: false,

  load: async () => {
    const isPremium = await premiumService.isPremium(CURRENT_USER_ID);
    set({ isPremium });
  },

  activate: async () => {
    set({ isLoading: true });
    await premiumService.setPremium(CURRENT_USER_ID, true);
    set({ isPremium: true, isLoading: false });
  },
}));
