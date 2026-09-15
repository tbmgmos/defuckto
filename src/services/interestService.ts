import { MutualInterestEvent } from '../models';
import { db, delay } from './localDatabase';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';
import { CURRENT_USER_ID } from '../data/users';

const MUTUAL_INTEREST_THRESHOLD = 2;

export const interestService = {
  /**
   * Call after any meaningful interaction with another user's profile
   * (unlocking a fact, asking a question). Fires a MutualInterestEvent
   * exactly once per pair, once the interaction count crosses the
   * threshold — spec §15 wants this to feel like a rare small event, not
   * something that fires on every tap.
   */
  async recordInteraction(otherUserId: string): Promise<MutualInterestEvent | null> {
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
    return delay(event);
  },
};
