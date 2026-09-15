import { create } from 'zustand';
import { Fact } from '../models';
import { factService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface FactsState {
  facts: Fact[];
  unlockedIds: Set<string>;
  isLoading: boolean;
  load: () => Promise<void>;
  applyFactUpdate: (fact: Fact) => void;
  markUnlocked: (factId: string) => void;
  addFact: (fact: Fact) => void;
}

export const useFactsStore = create<FactsState>((set, get) => ({
  facts: [],
  unlockedIds: new Set(),
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const [facts, unlockedIds] = await Promise.all([
      factService.getAllFacts(),
      factService.getUnlockedFactIds(CURRENT_USER_ID),
    ]);
    set({ facts, unlockedIds, isLoading: false });
  },

  applyFactUpdate: (fact) => {
    set({ facts: get().facts.map((f) => (f.id === fact.id ? fact : f)) });
  },

  markUnlocked: (factId) => {
    const next = new Set(get().unlockedIds);
    next.add(factId);
    set({ unlockedIds: next });
  },

  addFact: (fact) => {
    set({ facts: [fact, ...get().facts] });
  },
}));
