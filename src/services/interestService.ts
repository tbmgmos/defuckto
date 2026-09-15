import { MutualInterestEvent } from '../models';
import { db, delay } from './localDatabase';
import { economyService } from './economyService';
import { createId } from '../utils/id';
import { isoNow, localDayKey } from '../utils/date';
import { CURRENT_USER_ID } from '../data/users';

const MUTUAL_INTEREST_THRESHOLD = 2;

// Generous, but not unlimited — free-and-uncapped would make it rational to
// spark everyone in the feed, which drains the signal of any meaning.
export const FREE_SPARKS_PER_DAY = 15;

function sparkUsageToday(userId: string): number {
  const usage = db.dailySparkUsage.get(userId);
  if (!usage || usage.date !== localDayKey()) return 0;
  return usage.count;
}

function consumeSparkQuota(userId: string): void {
  const today = localDayKey();
  const usage = db.dailySparkUsage.get(userId);
  if (!usage || usage.date !== today) {
    db.dailySparkUsage.set(userId, { date: today, count: 1 });
  } else {
    usage.count += 1;
  }
}

export interface MutualInterestResult {
  event: MutualInterestEvent;
  unlockedFactIds: string[];
  unlockedPhotoIds: string[];
}

export const interestService = {
  /**
   * Call after any meaningful interaction with another user's profile
   * (unlocking a fact, asking a question). This is deliberately a
   * one-sided signal — *your* engagement with the same profile crossing a
   * threshold — not evidence the other person is interested back. The UI
   * (MutualInterestOverlay) must never claim otherwise or fabricate a
   * message on their behalf; it only offers to help you write to them
   * first, framed honestly as your move, not theirs.
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

  /**
   * A free, no-coins way to say "I'm interested" — the only signal in the
   * app that doesn't require spending. Doesn't unlock anything or open a
   * chat by itself; it just raises this person's odds of "getting curious
   * about you" in simulationService, so genuine (if lightweight) interest
   * has some real effect instead of being a pure dead end.
   *
   * Capped at FREE_SPARKS_PER_DAY — free-and-uncapped isn't the same thing
   * as meaningful, see the constant's comment above.
   */
  async sendSpark(otherUserId: string): Promise<void> {
    if (db.sparkedUserIds.has(otherUserId)) return delay(undefined, 0); // idempotent, already sparked

    if (sparkUsageToday(CURRENT_USER_ID) >= FREE_SPARKS_PER_DAY) {
      throw new Error(`Дневной лимит искр исчерпан (${FREE_SPARKS_PER_DAY}/день) — вернись завтра`);
    }

    consumeSparkQuota(CURRENT_USER_ID);
    db.sparkedUserIds.add(otherUserId);
    return delay(undefined, 0);
  },

  async getSparkedIds(): Promise<Set<string>> {
    return delay(new Set(db.sparkedUserIds), 0);
  },

  async sparksRemainingToday(): Promise<number> {
    return delay(Math.max(0, FREE_SPARKS_PER_DAY - sparkUsageToday(CURRENT_USER_ID)), 0);
  },
};
