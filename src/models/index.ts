// Core domain models. UI code must depend only on these types, never on
// data/*.ts mock shapes directly — that keeps a future backend swap
// (see services/*) from touching a single screen.

export type InterestKey =
  | 'music'
  | 'travel'
  | 'games'
  | 'sport'
  | 'food'
  | 'life'
  | 'weird';

export interface Interest {
  key: InterestKey;
  label: string;
  emoji: string;
}

export type FactCategory =
  | 'music'
  | 'travel'
  | 'games'
  | 'weird'
  | 'life'
  | 'food'
  | 'other';

export interface FactCategoryMeta {
  key: FactCategory;
  label: string;
  emoji: string;
}

// A moderation hook for later — never enforced in the demo, but every fact
// carries a status so a real moderation queue can be dropped in later.
export type ModerationStatus = 'approved' | 'pending' | 'rejected';

export interface Fact {
  id: string;
  authorId: string;
  text: string;
  category: FactCategory;
  price: number;
  unlockCount: number;
  createdAt: string;
  moderationStatus: ModerationStatus;
}

export interface FactPurchase {
  id: string;
  factId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  sellerEarnings: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: InterestKey[];
  photoSeed: string;
  isCurrentUser?: boolean;
}

export interface Wallet {
  userId: string;
  balance: number;
}

export type TransactionType =
  | 'fact_purchase' // this user paid to unlock someone else's fact
  | 'fact_sale' // this user earned because someone unlocked their fact
  | 'question_sent'
  | 'question_reward'
  | 'quest_reward'
  | 'starter_bonus';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // signed: negative = spend, positive = earn
  description: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  messages: Message[];
  createdAt: string;
}

export type QuestKey =
  | 'add_fact'
  | 'explore_profiles'
  | 'unlock_fact'
  | 'ask_question';

export interface Quest {
  key: QuestKey;
  title: string;
  reward: number;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface MutualInterestEvent {
  id: string;
  userId: string;
  otherUserId: string;
  createdAt: string;
  seen: boolean;
}
