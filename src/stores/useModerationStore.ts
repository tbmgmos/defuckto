import { create } from 'zustand';
import { moderationService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface ModerationState {
  blockedIds: Set<string>;
  isLoading: boolean;
  load: () => Promise<void>;
  block: (userId: string) => Promise<void>;
  unblock: (userId: string) => Promise<void>;
}

export const useModerationStore = create<ModerationState>((set, get) => ({
  blockedIds: new Set(),
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const blockedIds = await moderationService.getBlockedIds(CURRENT_USER_ID);
    set({ blockedIds, isLoading: false });
  },

  block: async (userId) => {
    await moderationService.blockUser(CURRENT_USER_ID, userId);
    const next = new Set(get().blockedIds);
    next.add(userId);
    set({ blockedIds: next });
  },

  unblock: async (userId) => {
    await moderationService.unblockUser(CURRENT_USER_ID, userId);
    const next = new Set(get().blockedIds);
    next.delete(userId);
    set({ blockedIds: next });
  },
}));
