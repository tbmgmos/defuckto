import { create } from 'zustand';
import { InterestTeaser } from '../models';
import { teaserService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface TeasersState {
  teasers: InterestTeaser[];
  isLoading: boolean;
  load: () => Promise<void>;
  addTeaser: (teaser: InterestTeaser) => void;
  applyReveal: (teaser: InterestTeaser) => void;
}

export const useTeasersStore = create<TeasersState>((set, get) => ({
  teasers: [],
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const teasers = await teaserService.getTeasersForUser(CURRENT_USER_ID);
    set({ teasers, isLoading: false });
  },

  addTeaser: (teaser) => set({ teasers: [teaser, ...get().teasers] }),

  applyReveal: (teaser) => {
    set({ teasers: get().teasers.map((t) => (t.id === teaser.id ? teaser : t)) });
  },
}));
