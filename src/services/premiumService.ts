import { db, delay } from './localDatabase';

// Real payments are explicitly out of scope (spec §18, §27) — this is an
// honest local toggle so the paywall UI and its gated features (reveal-who
// list, discounted unlocks) can be built and demoed, not a working
// subscription. Swap this file's body for a real billing SDK later.
export const premiumService = {
  async isPremium(userId: string): Promise<boolean> {
    return delay(db.isPremium.get(userId) ?? false, 0);
  },

  async setPremium(userId: string, value: boolean): Promise<void> {
    db.isPremium.set(userId, value);
    return delay(undefined, 400);
  },
};
