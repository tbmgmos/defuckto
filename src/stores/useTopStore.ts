import { create } from 'zustand';
import { TopPlacement } from '../models';
import { leaderboardService, topService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface TopState {
  /** The current ТОП 100, best spot first. */
  placements: TopPlacement[];
  /** Authors who lead a category this week — the star badge. */
  starIds: Set<string>;
  load: () => Promise<void>;
  isInTop: (userId: string) => boolean;
  isMineInTop: () => boolean;
}

export const useTopStore = create<TopState>((set, get) => ({
  placements: [],
  starIds: new Set(),

  load: async () => {
    const [placements, stars] = await Promise.all([topService.getTop(), leaderboardService.getWeeklyStars()]);
    set({ placements, starIds: new Set(stars.map((s) => s.authorId)) });
  },

  isInTop: (userId) => get().placements.some((p) => p.userId === userId),

  isMineInTop: () => get().isInTop(CURRENT_USER_ID),
}));
