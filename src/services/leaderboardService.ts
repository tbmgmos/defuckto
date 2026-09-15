import { FactCategory } from '../models';
import { db, delay } from './localDatabase';
import { FACT_CATEGORY_LIST } from '../data/factCategories';

export interface CategoryStar {
  category: FactCategory;
  authorId: string;
  totalUnlocks: number;
}

// Scoped per-category on purpose (spec feedback: a single global ranking
// would just crown the same one or two people and demotivate everyone
// else). "Звезда недели" per category means many people can be #1 at
// something.
export const leaderboardService = {
  async getWeeklyStars(): Promise<CategoryStar[]> {
    const stars: CategoryStar[] = [];
    for (const cat of FACT_CATEGORY_LIST) {
      const totals = new Map<string, number>();
      db.facts
        .filter((f) => f.category === cat.key)
        .forEach((f) => totals.set(f.authorId, (totals.get(f.authorId) ?? 0) + f.unlockCount));

      let bestAuthor: string | null = null;
      let bestTotal = 0;
      totals.forEach((total, authorId) => {
        if (total > bestTotal) {
          bestTotal = total;
          bestAuthor = authorId;
        }
      });

      if (bestAuthor && bestTotal > 0) {
        stars.push({ category: cat.key, authorId: bestAuthor, totalUnlocks: bestTotal });
      }
    }
    return delay(stars);
  },
};
