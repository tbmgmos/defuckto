// Orchestration layer: the only place a screen should call into for
// anything that touches money, quests, or cross-store state. Screens stay
// dumb — they call these functions and render whatever the stores end up
// holding. See spec §32: "UI не должен содержать бизнес-логику экономики".

import {
  CreateFactInput,
  chatService,
  economyService,
  factService,
  interestService,
  moderationService,
  notificationService,
  referralService,
  simulationService,
  teaserService,
  userService,
  verificationService,
  walletService,
  REFERRAL_BONUS,
} from '../services';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { dayWord } from '../utils/pluralize';
import { useWalletStore } from './useWalletStore';
import { useFactsStore } from './useFactsStore';
import { usePhotosStore } from './usePhotosStore';
import { useQuestsStore } from './useQuestsStore';
import { useUsersStore } from './useUsersStore';
import { useChatStore } from './useChatStore';
import { useInterestStore } from './useInterestStore';
import { useToastStore } from './useToastStore';
import { useModerationStore } from './useModerationStore';
import { useStreakStore } from './useStreakStore';
import { useTeasersStore } from './useTeasersStore';
import { usePremiumStore } from './usePremiumStore';
import { useSparkStore } from './useSparkStore';
import { useNotificationsStore } from './useNotificationsStore';
import { Fact, ProfilePhoto } from '../models';

export async function bootstrapApp(): Promise<void> {
  await Promise.all([
    useWalletStore.getState().load(),
    useFactsStore.getState().load(),
    usePhotosStore.getState().load(),
    useUsersStore.getState().load(),
    useQuestsStore.getState().load(),
    useChatStore.getState().load(),
    useModerationStore.getState().load(),
    useStreakStore.getState().load(),
    useTeasersStore.getState().load(),
    usePremiumStore.getState().load(),
    useSparkStore.getState().load(),
    useNotificationsStore.getState().load(),
  ]);
}

/** Free "I'm interested" signal — see interestService.sendSpark. */
export async function sendSpark(userId: string): Promise<void> {
  await interestService.sendSpark(userId);
  useSparkStore.getState().markSparked(userId);
  useToastStore.getState().show('Отметил интерес', 'success');
}

/** Advances the daily streak at most once per day and surfaces the bonus, if any. */
async function touchDailyStreak(): Promise<void> {
  const { advanced, bonus } = await useStreakStore.getState().recordToday();
  if (!advanced) return;
  await walletService.earnCoins(CURRENT_USER_ID, bonus, 'Серия дней подряд', 'streak_bonus');
  await useWalletStore.getState().load();
  const streak = useStreakStore.getState().streak;
  const count = streak?.currentStreak ?? 0;
  const message = `Серия ${count} ${dayWord(count)} подряд · +${bonus}`;
  useToastStore.getState().show(message, 'success');
  useNotificationsStore.getState().push('flame', message);
}

export async function exploreProfile(userId: string): Promise<void> {
  const isFirstVisit = useUsersStore.getState().markExplored(userId);
  if (isFirstVisit) {
    await useQuestsStore.getState().advance('explore_profiles');
  }
}

export interface PurchaseOutcome {
  fact: Fact;
  sellerEarnings: number;
  pricePaid: number;
  mutualInterest: boolean;
}

/** Applies a mutual-interest result to the facts/photos stores and, if it granted anything, says so. */
function applyMutualInterestGrant(result: Awaited<ReturnType<typeof interestService.recordInteraction>>): void {
  if (!result) return;
  useInterestStore.getState().show(result.event);
  result.unlockedFactIds.forEach((id) => useFactsStore.getState().markUnlocked(id));
  result.unlockedPhotoIds.forEach((id) => usePhotosStore.getState().markUnlocked(id));
  const grantedCount = result.unlockedFactIds.length + result.unlockedPhotoIds.length;
  if (grantedCount > 0) {
    const message = 'Взаимный интерес — весь остальной профиль открыт бесплатно';
    useToastStore.getState().show(message, 'success');
    useNotificationsStore.getState().push('sparkles', message);
  }
}

export async function purchaseFact(fact: Fact): Promise<PurchaseOutcome> {
  const buyer = useUsersStore.getState().currentUser;
  const author = getUserById(fact.authorId);
  if (!buyer || !author) throw new Error('Не удалось определить пользователей');

  const result = await economyService.purchaseFact(CURRENT_USER_ID, fact.id, buyer.name, author.name);

  useFactsStore.getState().applyFactUpdate(result.fact);
  useFactsStore.getState().markUnlocked(fact.id);
  await useQuestsStore.getState().advance('unlock_fact');
  await useWalletStore.getState().load();
  await touchDailyStreak();

  const mutualEvent = await interestService.recordInteraction(fact.authorId);
  applyMutualInterestGrant(mutualEvent);

  return { fact: result.fact, sellerEarnings: result.sellerEarnings, pricePaid: result.pricePaid, mutualInterest: !!mutualEvent };
}

export interface PurchasePhotoOutcome {
  photo: ProfilePhoto;
  pricePaid: number;
}

export async function purchasePhoto(photo: ProfilePhoto): Promise<PurchasePhotoOutcome> {
  const buyer = useUsersStore.getState().currentUser;
  const author = getUserById(photo.ownerId);
  if (!buyer || !author) throw new Error('Не удалось определить пользователей');

  const result = await economyService.purchasePhoto(CURRENT_USER_ID, photo.id, buyer.name, author.name);

  usePhotosStore.getState().applyPhotoUpdate(result.photo);
  usePhotosStore.getState().markUnlocked(photo.id);
  await useWalletStore.getState().load();
  await touchDailyStreak();

  return { photo: result.photo, pricePaid: result.pricePaid };
}

export interface AskQuestionOutcome {
  wasFree: boolean;
  pricePaid: number;
  freeQuestionsRemaining: number;
}

export async function askQuestion(fact: Fact, questionText: string): Promise<AskQuestionOutcome> {
  const buyer = useUsersStore.getState().currentUser;
  if (!buyer) throw new Error('Не удалось определить пользователя');

  const result = await economyService.askQuestion(CURRENT_USER_ID, fact.id, buyer.name, questionText);

  await useQuestsStore.getState().advance('ask_question');
  await useWalletStore.getState().load();
  await touchDailyStreak();

  const conversation = await chatService.getConversation(result.conversationId);
  if (conversation) useChatStore.getState().upsertConversation(conversation);

  const mutualEvent = await interestService.recordInteraction(fact.authorId);
  applyMutualInterestGrant(mutualEvent);

  return { wasFree: result.wasFree, pricePaid: result.pricePaid, freeQuestionsRemaining: result.freeQuestionsRemaining };
}

/**
 * Opens (or finds) a conversation with someone directly — no fact unlock
 * required first. Writing to a person shouldn't be gated behind buying
 * their content; that's what makes the paid stuff feel like a toll booth
 * instead of a nice-to-have.
 */
export async function openConversationWith(otherUserId: string): Promise<string> {
  const conversation = await chatService.openConversation(CURRENT_USER_ID, otherUserId);
  useChatStore.getState().upsertConversation(conversation);
  return conversation.id;
}

export async function publishFact(input: CreateFactInput): Promise<Fact> {
  const fact = await factService.createFact(input);
  useFactsStore.getState().addFact(fact);
  useFactsStore.getState().markUnlocked(fact.id);
  await useQuestsStore.getState().advance('add_fact');
  await useWalletStore.getState().load();
  await touchDailyStreak();
  return fact;
}

export async function sendChatMessage(conversationId: string, text: string): Promise<void> {
  await useChatStore.getState().sendMessage(conversationId, text);
}

export async function simulateIncomingActivity(): Promise<void> {
  const result = await simulationService.maybeSimulateIncomingActivity();
  if (!result) return;

  if (result.kind === 'unlock') {
    await useWalletStore.getState().load();
    const message = `+${result.amount} · ${result.buyerName} открыл(а) твой факт`;
    useToastStore.getState().show(message, 'success');
    useNotificationsStore.getState().push('lock-open-outline', message);
    await notificationService.notify('Твой факт открыли', message);
  } else {
    await useTeasersStore.getState().load();
    const message = 'Кто-то заинтересовался твоим фактом';
    useToastStore.getState().show(message, 'default');
    useNotificationsStore.getState().push('eye-outline', message);
    await notificationService.notify('DEFUCKTO', message);
  }
}

export async function revealTeaser(teaserId: string): Promise<string> {
  const teaser = await teaserService.reveal(teaserId, CURRENT_USER_ID);
  useTeasersStore.getState().applyReveal(teaser);
  await useWalletStore.getState().load();
  const curious = getUserById(teaser.curiousUserId);
  return curious?.name ?? 'Кто-то';
}

export async function updateProfilePhoto(photoUri: string): Promise<void> {
  await userService.updatePhoto(CURRENT_USER_ID, photoUri);
  useUsersStore.getState().setPhoto(photoUri);
  useToastStore.getState().show('Фото профиля обновлено', 'success');
}

export async function removeProfilePhoto(): Promise<void> {
  await userService.updatePhoto(CURRENT_USER_ID, null);
  useUsersStore.getState().setPhoto(null);
  useToastStore.getState().show('Фото удалено', 'default');
}

export async function updateBio(bio: string): Promise<void> {
  await userService.updateBio(CURRENT_USER_ID, bio);
  useUsersStore.getState().setBio(bio);
  useToastStore.getState().show('Изменения сохранены', 'success');
}

export async function submitVerification(): Promise<void> {
  await verificationService.submitVerification(CURRENT_USER_ID);
  useUsersStore.getState().setVerified(true);
}

export async function reportFact(factId: string, reason: string): Promise<void> {
  await moderationService.reportContent(CURRENT_USER_ID, 'fact', factId, reason);
  useToastStore.getState().show('Жалоба отправлена. Спасибо, что следишь за качеством.', 'success');
}

export async function reportUser(userId: string, reason: string): Promise<void> {
  await moderationService.reportContent(CURRENT_USER_ID, 'user', userId, reason);
  useToastStore.getState().show('Жалоба отправлена.', 'success');
}

export async function blockUser(userId: string): Promise<void> {
  await useModerationStore.getState().block(userId);
  useToastStore.getState().show('Пользователь заблокирован.', 'success');
}

export async function redeemReferral(): Promise<void> {
  await referralService.simulateRedeem(CURRENT_USER_ID);
  await walletService.earnCoins(CURRENT_USER_ID, REFERRAL_BONUS, 'Друг присоединился по твоему коду', 'referral_bonus');
  await useWalletStore.getState().load();
  const message = `+${REFERRAL_BONUS} · Друг присоединился по твоему коду`;
  useToastStore.getState().show(message, 'success');
  useNotificationsStore.getState().push('gift-outline', message);
}

export async function activatePremium(): Promise<void> {
  await usePremiumStore.getState().activate();
  useToastStore.getState().show('DEFUCKTO+ активирован (демо-режим).', 'success');
}
