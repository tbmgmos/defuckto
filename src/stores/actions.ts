// Orchestration layer: the only place a screen should call into for
// anything that touches money, quests, or cross-store state. Screens stay
// dumb — they call these functions and render whatever the stores end up
// holding. See spec §32: "UI не должен содержать бизнес-логику экономики".

import { CreateFactInput, chatService, economyService, factService, interestService, simulationService } from '../services';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { useWalletStore } from './useWalletStore';
import { useFactsStore } from './useFactsStore';
import { useQuestsStore } from './useQuestsStore';
import { useUsersStore } from './useUsersStore';
import { useChatStore } from './useChatStore';
import { useInterestStore } from './useInterestStore';
import { useToastStore } from './useToastStore';
import { Fact } from '../models';

export async function bootstrapApp(): Promise<void> {
  await Promise.all([
    useWalletStore.getState().load(),
    useFactsStore.getState().load(),
    useUsersStore.getState().load(),
    useQuestsStore.getState().load(),
    useChatStore.getState().load(),
  ]);
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
  mutualInterest: boolean;
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

  const mutualEvent = await interestService.recordInteraction(fact.authorId);
  if (mutualEvent) useInterestStore.getState().show(mutualEvent);

  return { fact: result.fact, sellerEarnings: result.sellerEarnings, mutualInterest: !!mutualEvent };
}

export async function askQuestion(fact: Fact, questionText: string): Promise<void> {
  const buyer = useUsersStore.getState().currentUser;
  if (!buyer) throw new Error('Не удалось определить пользователя');

  const result = await economyService.askQuestion(CURRENT_USER_ID, fact.id, buyer.name, questionText);

  await useQuestsStore.getState().advance('ask_question');
  await useWalletStore.getState().load();

  const conversation = await chatService.getConversation(result.conversationId);
  if (conversation) useChatStore.getState().upsertConversation(conversation);

  const mutualEvent = await interestService.recordInteraction(fact.authorId);
  if (mutualEvent) useInterestStore.getState().show(mutualEvent);
}

export async function publishFact(input: CreateFactInput): Promise<Fact> {
  const fact = await factService.createFact(input);
  useFactsStore.getState().addFact(fact);
  useFactsStore.getState().markUnlocked(fact.id);
  await useQuestsStore.getState().advance('add_fact');
  await useWalletStore.getState().load();
  return fact;
}

export async function sendChatMessage(conversationId: string, text: string): Promise<void> {
  await useChatStore.getState().sendMessage(conversationId, text);
}

export async function simulateIncomingActivity(): Promise<void> {
  const result = await simulationService.maybeSimulateIncomingUnlock();
  if (!result) return;
  await useWalletStore.getState().load();
  useToastStore.getState().show(`+${result.amount} 🪙 · ${result.buyerName} открыл(а) твой факт`, 'success');
}
