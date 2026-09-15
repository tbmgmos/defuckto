import { create } from 'zustand';
import { interestService } from '../services';

interface SparkState {
  sparkedIds: Set<string>;
  load: () => Promise<void>;
  markSparked: (userId: string) => void;
}

export const useSparkStore = create<SparkState>((set, get) => ({
  sparkedIds: new Set(),

  load: async () => {
    const sparkedIds = await interestService.getSparkedIds();
    set({ sparkedIds });
  },

  markSparked: (userId) => {
    const next = new Set(get().sparkedIds);
    next.add(userId);
    set({ sparkedIds: next });
  },
}));
