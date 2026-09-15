// The in-memory "database" backing every service in this folder.
//
// Every service function is async and goes through `delay()` so screens
// already handle loading states the same way they will once a real API
// replaces this file — swapping the backend later means rewriting the
// bodies of services/*.ts, not touching any screen or store.

import { Conversation, Fact, FactPurchase, Quest, Transaction, User, Wallet, MutualInterestEvent } from '../models';
import { FACTS } from '../data/facts';
import { USERS, CURRENT_USER_ID } from '../data/users';
import { CONVERSATIONS } from '../data/conversations';
import { INITIAL_QUESTS } from '../data/quests';
import { createId } from '../utils/id';
import { isoDaysAgo, isoHoursAgo, isoMinutesAgo } from '../utils/date';

export const STARTER_BALANCE = 342;
export const SELLER_SHARE = 0.7; // author keeps ~70% of what a buyer pays

export const db = {
  users: [...USERS] as User[],
  facts: FACTS.map((f) => ({ ...f })) as Fact[],
  conversations: CONVERSATIONS.map((c) => ({ ...c, messages: [...c.messages] })) as Conversation[],
  quests: INITIAL_QUESTS.map((q) => ({ ...q })) as Quest[],
  purchases: [] as FactPurchase[],
  mutualInterests: [] as MutualInterestEvent[],
  wallets: new Map<string, Wallet>(),
  transactions: [] as Transaction[],
  interactionCounts: new Map<string, number>(),
};

// Seed wallets — the current user gets the spec'd starter balance, every
// mock user gets a modest float so seller-side bookkeeping stays sane.
db.users.forEach((u) => {
  db.wallets.set(u.id, { userId: u.id, balance: u.isCurrentUser ? STARTER_BALANCE : 120 });
});

db.transactions.push({
  id: createId('tx'),
  userId: CURRENT_USER_ID,
  type: 'starter_bonus',
  amount: STARTER_BALANCE,
  description: 'Добро пожаловать в DEFUCKTO',
  createdAt: isoDaysAgo(1),
});

// A little seeded history so the wallet screen feels alive on first launch.
db.transactions.push(
  {
    id: createId('tx'),
    userId: CURRENT_USER_ID,
    type: 'fact_sale',
    amount: 17,
    description: 'Маша открыла твой факт',
    createdAt: isoHoursAgo(20),
  },
  {
    id: createId('tx'),
    userId: CURRENT_USER_ID,
    type: 'fact_purchase',
    amount: -25,
    description: 'Ты открыл факт Маши',
    createdAt: isoHoursAgo(19),
  },
  {
    id: createId('tx'),
    userId: CURRENT_USER_ID,
    type: 'quest_reward',
    amount: 20,
    description: 'Ежедневное задание',
    createdAt: isoMinutesAgo(90),
  },
);

export function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
