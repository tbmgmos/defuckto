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
  // nothing else in the app needs to change to support that later.
  async createFact(input: CreateFactInput): Promise<Fact> {
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
      moderationStatus: 'approved',
    };
    db.facts.unshift(fact);
    return delay(fact);
  },
};
