import { Fact, FactCategory, FactType } from '../models';
import { db, delay } from './localDatabase';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

export interface CreateFactInput {
  authorId: string;
  text: string;
  category: FactCategory;
  price: number;
  type?: FactType;
  durationSec?: number;
  audioUri?: string;
  hot?: boolean;
}

export interface FactActions {
  /** Next free, not-yet-shown fact. */
  free: Fact | null;
  /** Cheapest locked, not-yet-shown fact. */
  paid: Fact | null;
  /** Next approved hot fact (already-unlocked ones first). */
  hot: Fact | null;
  /** Facts the viewer already owns (bought earlier) that are not on screen yet. */
  opened: Fact[];
}

/**
 * What a viewer can do next on someone's profile, given what is already on
 * screen. Drives the "еще факт / еще факт $ / горячий факт / открытый факт"
 * buttons — a button only exists when there is something behind it.
 */
export function planFactActions(facts: Fact[], unlockedIds: ReadonlySet<string>, shownIds: readonly string[]): FactActions {
  const shown = new Set(shownIds);
  const rest = facts.filter((f) => !shown.has(f.id) && f.moderationStatus !== 'rejected');
  const regular = rest.filter((f) => !f.hot);

  const free = regular.find((f) => f.price === 0) ?? null;
  const paid =
    regular
      .filter((f) => f.price > 0 && !unlockedIds.has(f.id))
      .sort((a, b) => a.price - b.price)[0] ?? null;
  const hotCandidates = rest.filter((f) => f.hot && f.moderationStatus === 'approved');
  const hot = hotCandidates.find((f) => unlockedIds.has(f.id)) ?? hotCandidates[0] ?? null;
  const opened = regular.filter((f) => f.price > 0 && unlockedIds.has(f.id));

  return { free, paid, hot, opened };
}

export const factService = {
  async getAllFacts(): Promise<Fact[]> {
    return delay(db.facts.filter((f) => f.moderationStatus !== 'rejected'));
  },

  async getFactsByAuthor(authorId: string): Promise<Fact[]> {
    return delay(db.facts.filter((f) => f.authorId === authorId));
  },

  async getFactById(id: string): Promise<Fact | undefined> {
    return delay(db.facts.find((f) => f.id === id));
  },

  /** Whether `userId` already has access to this fact (free facts count as unlocked for everyone). */
  async isUnlockedForUser(factId: string, userId: string): Promise<boolean> {
    const fact = db.facts.find((f) => f.id === factId);
    if (!fact) return false;
    if (fact.price === 0) return true;
    if (fact.authorId === userId) return true;
    return db.purchases.some((p) => p.factId === factId && p.buyerId === userId);
  },

  async getUnlockedFactIds(userId: string): Promise<Set<string>> {
    const unlocked = new Set<string>();
    db.facts.forEach((f) => {
      if (f.price === 0 || f.authorId === userId) unlocked.add(f.id);
    });
    db.purchases.filter((p) => p.buyerId === userId).forEach((p) => unlocked.add(p.factId));
    return delay(unlocked);
  },

  // New facts start "approved" in this demo. A real moderation queue would
  // insert them as "pending" here and flip the status once reviewed —
  // nothing else in the app needs to change to support that later. The one
  // exception is a hot fact: it starts "pending" and other people only see it
  // once approved (see planFactActions), so the demo has no way to approve it
  // yet — the author just sees it marked as on review.
  async createFact(input: CreateFactInput): Promise<Fact> {
    if (input.hot && input.price <= 0) throw new Error('Горячий факт не может быть бесплатным');
    const fact: Fact = {
      id: createId('f'),
      authorId: input.authorId,
      text: input.text.trim(),
      type: input.type ?? 'text',
      durationSec: input.durationSec,
      audioUri: input.audioUri,
      category: input.category,
      price: input.price,
      unlockCount: 0,
      createdAt: isoNow(),
      moderationStatus: input.hot ? 'pending' : 'approved',
      hot: input.hot || undefined,
    };
    db.facts.unshift(fact);
    return delay(fact);
  },
};
