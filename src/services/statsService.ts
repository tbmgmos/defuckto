import { db } from './localDatabase';

// Baselines representing "history before this demo session" — a real
// backend would compute all three fields straight from persisted rows.
// The like ratio in particular has no reaction model in this demo (see
// UserProfileScreen's ephemeral 👍/👎), so it stays a fixed illustrative
// number rather than faking a computation.
const FACTS_UNLOCKED_BASELINE = 81;
const LIKE_PERCENTAGE = 94;

export interface ProfileStats {
  factsOpenedByOthers: number;
  factsUnlockedByUser: number;
  likePercentage: number;
}

export const statsService = {
  async getProfileStats(userId: string): Promise<ProfileStats> {
    const factsOpenedByOthers = db.facts
      .filter((f) => f.authorId === userId)
      .reduce((sum, f) => sum + f.unlockCount, 0);

    const livePurchases = db.purchases.filter((p) => p.buyerId === userId).length;

    return {
      factsOpenedByOthers,
      factsUnlockedByUser: FACTS_UNLOCKED_BASELINE + livePurchases,
      likePercentage: LIKE_PERCENTAGE,
    };
  },
};
