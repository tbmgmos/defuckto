import { create } from 'zustand';
import { Quest, QuestKey } from '../models';
import { questService } from '../services';

interface QuestsState {
  quests: Quest[];
  isLoading: boolean;
  justCompletedKey: QuestKey | null;
  load: () => Promise<void>;
  advance: (key: QuestKey, amount?: number) => Promise<boolean>;
  clearJustCompleted: () => void;
}

export const useQuestsStore = create<QuestsState>((set, get) => ({
  quests: [],
  isLoading: false,
  justCompletedKey: null,

  load: async () => {
    set({ isLoading: true });
    const quests = await questService.getQuests();
    set({ quests, isLoading: false });
  },

  advance: async (key, amount = 1) => {
    const { quest, justCompleted } = await questService.advance(key, amount);
    if (!quest) return false;
    set({
      quests: get().quests.map((q) => (q.key === key ? quest : q)),
      justCompletedKey: justCompleted ? key : get().justCompletedKey,
    });
    return justCompleted;
  },

  clearJustCompleted: () => set({ justCompletedKey: null }),
}));
