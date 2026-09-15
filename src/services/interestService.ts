import { MutualInterestEvent } from '../models';
import { db, delay } from './localDatabase';
import { economyService } from './economyService';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';
import { CURRENT_USER_ID } from '../data/users';

const MUTUAL_INTEREST_THRESHOLD = 2;

export interface MutualInterestResult {
  event: MutualInterestEvent;
  unlockedFactIds: string[];
  unlockedPhotoIds: string[];
}

export const interestService = {
  /**
   * Call after any meaningful interaction with another user's profile
   * (unlocking a fact, asking a question). Fires a MutualInterestEvent
   * exactly once per pair, once the interaction count crosses the
   * threshold — spec §15 wants this to feel like a rare small event, not
   * something that fires on every tap.
   *
   * Once it fires, it also grants free access to the rest of that person's
   * paid facts/photos (see economyService.grantFullAccess) — sustained
   * interest should be rewarded with openness, not more paywalls.
   */
  async recordInteraction(otherUserId: string): Promise<MutualInterestResult | null> {
    const count = (db.interactionCounts.get(otherUserId) ?? 0) + 1;
    db.interactionCounts.set(otherUserId, count);

    const alreadyFired = db.mutualInterests.some((e) => e.otherUserId === otherUserId);
    if (count < MUTUAL_INTEREST_THRESHOLD || alreadyFired) {
      return delay(null, 0);
    }

    const event: MutualInterestEvent = {
      id: createId('mi'),
      userId: CURRENT_USER_ID,
      otherUserId,
      createdAt: isoNow(),
      seen: false,
    };
    db.mutualInterests.push(event);

    const { unlockedFactIds, unlockedPhotoIds } = await economyService.grantFullAccess(CURRENT_USER_ID, otherUserId);

    return delay({ event, unlockedFactIds, unlockedPhotoIds });
  },
};
