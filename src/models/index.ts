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
  icon: string; // Ionicons glyph name
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
  icon: string; // Ionicons glyph name
}

// A moderation hook for later — never enforced in the demo, but every fact
// carries a status so a real moderation queue can be dropped in later.
export type ModerationStatus = 'approved' | 'pending' | 'rejected';

export type FactType = 'text' | 'voice';

export interface Fact {
  id: string;
  authorId: string;
  text: string; // for voice facts, a short transcript/caption shown alongside the waveform
  type: FactType;
  durationSec?: number; // voice facts only
  audioUri?: string; // voice facts only — local file URI recorded on-device
  category: FactCategory;
  price: number; // base price; the price actually charged grows with unlockCount, see economyService.computeCurrentPrice
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

// A profile photo beyond the first (always-free) one — unlockable with
// coins, exactly like a fact. Mirrors the fact purchase flow on purpose:
// "не всё видно на фото" turned into an actual product mechanic.
export interface ProfilePhoto {
  id: string;
  ownerId: string;
  seed: string; // drives the placeholder gradient, distinct per photo
  price: number; // 0 = the free profile-cover photo
  unlockCount: number;
  createdAt: string;
}

export interface PhotoPurchase {
  id: string;
  photoId: string;
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
  verified?: boolean;
  isCurrentUser?: boolean;
}

export interface Wallet {
  userId: string;
  balance: number;
}

export type TransactionType =
  | 'fact_purchase' // this user paid to unlock someone else's fact
  | 'fact_sale' // this user earned because someone unlocked their fact
  | 'photo_purchase'
  | 'photo_sale'
  | 'question_sent'
  | 'question_reward'
  | 'quest_reward'
  | 'streak_bonus'
  | 'referral_bonus'
  | 'reveal_interest' // spent coins to see who's curious about them
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

export type ReportTargetType = 'user' | 'fact';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  createdAt: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

// A teaser for "кто-то хочет узнать про тебя" — deliberately withholds the
// curious person's identity until the recipient spends coins to reveal it,
// so revealing interest is itself part of the economy, not a free feature.
export interface InterestTeaser {
  id: string;
  recipientId: string; // the author being asked about
  curiousUserId: string; // withheld from the UI until revealed
  factId: string;
  createdAt: string;
  revealed: boolean;
}

export interface StreakState {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // yyyy-mm-dd, local
}

export interface ReferralInfo {
  code: string;
  ownerId: string;
  invitesRedeemed: number;
}

// A persistent record of things that happened to the user (fact sold,
// mutual interest, streak bonus…) — the notification bell's history, as
// opposed to useToastStore's ephemeral 2.4s pop-up for the same events.
export interface AppNotification {
  id: string;
  icon: string; // Ionicons glyph name
  title: string;
  createdAt: string;
  read: boolean;
}

export interface DiscoveryFilters {
  minAge: number;
  maxAge: number;
  city: string | null; // null = any city
  interests: InterestKey[]; // empty = any interest
}
