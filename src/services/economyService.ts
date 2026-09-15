// The only place money moves. Screens and stores call purchaseFact() /
// askQuestion() — never spendCoins()/earnCoins() directly — so the split
// between buyer and seller lives in exactly one place.

import { db, delay, SELLER_SHARE } from './localDatabase';
import { walletService } from './walletService';
import { factService } from './factService';
import { chatService } from './chatService';
import { Fact, FactPurchase, TransactionType, Wallet } from '../models';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

export const QUESTION_PRICE = 15;

function sellerCut(price: number): number {
  return Math.round(price * SELLER_SHARE);
}

async function rewardFactOwner(sellerId: string, amount: number, description: string, type: TransactionType): Promise<Wallet> {
  return walletService.earnCoins(sellerId, amount, description, type);
}

export interface PurchaseFactResult {
  buyerWallet: Wallet;
  sellerEarnings: number;
  purchase: FactPurchase;
  fact: Fact;
}

export const economyService = {
  async purchaseFact(buyerId: string, factId: string, buyerName: string, authorName: string): Promise<PurchaseFactResult> {
    const fact = db.facts.find((f) => f.id === factId);
    if (!fact) throw new Error('Факт не найден');
    if (fact.price === 0) throw new Error('Этот факт уже открыт');
    if (fact.authorId === buyerId) throw new Error('Это твой собственный факт');

    const alreadyUnlocked = await factService.isUnlockedForUser(factId, buyerId);
    if (alreadyUnlocked) throw new Error('Факт уже открыт');

    const buyerWallet = await walletService.spendCoins(
      buyerId,
      fact.price,
      `Ты открыл факт ${authorName}`,
      'fact_purchase',
    );

    const sellerEarnings = sellerCut(fact.price);
    await rewardFactOwner(fact.authorId, sellerEarnings, `${buyerName} открыл(а) твой факт`, 'fact_sale');

    fact.unlockCount += 1;

    const purchase: FactPurchase = {
      id: createId('fp'),
      factId,
      buyerId,
      sellerId: fact.authorId,
      price: fact.price,
      sellerEarnings,
      createdAt: isoNow(),
    };
    db.purchases.push(purchase);

    return delay({ buyerWallet, sellerEarnings, purchase, fact: { ...fact } });
  },

  async askQuestion(buyerId: string, factId: string, buyerName: string, questionText: string): Promise<{ wallet: Wallet; conversationId: string }> {
    const fact = db.facts.find((f) => f.id === factId);
    if (!fact) throw new Error('Факт не найден');
    if (fact.authorId === buyerId) throw new Error('Нельзя задать вопрос самому себе');

    const wallet = await walletService.spendCoins(
      buyerId,
      QUESTION_PRICE,
      `Вопрос: ${fact.text.slice(0, 24)}${fact.text.length > 24 ? '…' : ''}`,
      'question_sent',
    );

    const reward = sellerCut(QUESTION_PRICE);
    await rewardFactOwner(fact.authorId, reward, `${buyerName} задал(а) тебе вопрос`, 'question_reward');

    const conversation = await chatService.sendMessageTo(fact.authorId, buyerId, questionText);

    return delay({ wallet, conversationId: conversation.id });
  },
};
