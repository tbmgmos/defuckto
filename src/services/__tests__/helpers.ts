import { db } from '../localDatabase';
import { INITIAL_QUESTS } from '../../data/quests';
import { Fact, ProfilePhoto } from '../../models';

export const BUYER = 'u_test_buyer';
export const SELLER = 'u_test_seller';

/** Empties the shared in-memory db so every test starts from a known state. */
export function resetDb(): void {
  db.users.length = 0;
  db.facts.length = 0;
  db.photos.length = 0;
  db.conversations.length = 0;
  db.purchases.length = 0;
  db.photoPurchases.length = 0;
  db.mutualInterests.length = 0;
  db.transactions.length = 0;
  db.teasers.length = 0;
  db.topPlacements.clear();
  db.notifications.length = 0;
  db.wallets.clear();
  db.interactionCounts.clear();
  db.dailyQuestionUsage.clear();
  db.dailySparkUsage.clear();
  db.sparkedUserIds.clear();
  db.quests.length = 0;
  db.quests.push(...INITIAL_QUESTS.map((q) => ({ ...q })));
}

export function seedWallet(userId: string, balance: number): void {
  db.wallets.set(userId, { userId, balance });
}

export function balanceOf(userId: string): number {
  return db.wallets.get(userId)?.balance ?? 0;
}

let seq = 0;

export function seedFact(overrides: Partial<Fact> = {}): Fact {
  seq += 1;
  const fact: Fact = {
    id: `f_test_${seq}`,
    authorId: SELLER,
    text: 'Тестовый факт',
    type: 'text',
    category: 'life',
    price: 100,
    unlockCount: 0,
    createdAt: new Date().toISOString(),
    moderationStatus: 'approved',
    ...overrides,
  };
  db.facts.push(fact);
  return fact;
}

export function seedPhoto(overrides: Partial<ProfilePhoto> = {}): ProfilePhoto {
  seq += 1;
  const photo: ProfilePhoto = {
    id: `p_test_${seq}`,
    ownerId: SELLER,
    seed: `seed_${seq}`,
    price: 100,
    unlockCount: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
  db.photos.push(photo);
  return photo;
}
