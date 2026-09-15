// The only place money moves. Screens and stores call purchaseFact() /
// purchasePhoto() / askQuestion() / revealTeaser() — never spendCoins()/
// earnCoins() directly — so the split between buyer and seller, and the
// price-growth curve, live in exactly one place.

import { db, delay, SELLER_SHARE } from './localDatabase';
import { walletService } from './walletService';
import { factService } from './factService';
import { photoService } from './photoService';
import { chatService } from './chatService';
import { Fact, FactPurchase, PhotoPurchase, ProfilePhoto, TransactionType, Wallet } from '../models';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

export const QUESTION_PRICE = 15;
export const REVEAL_INTEREST_PRICE = 12;

function sellerCut(price: number): number {
  return Math.round(price * SELLER_SHARE);
}

/**
 * The price actually charged grows with demand: every previous unlock adds
 * 8%, capped at +80% (10 unlocks). A brand-new fact/photo is cheap and gets
 * pricier as it proves itself — early buyers are rewarded, popular authors
 * earn more per sale over time, and "53 человека уже узнали" becomes a
 * price signal, not just a vanity number.
 */
export function computeCurrentPrice(basePrice: number, unlockCount: number): number {
  if (basePrice <= 0) return 0;
  const growth = 1 + Math.min(unlockCount, 10) * 0.08;
  return Math.round(basePrice * growth);
}

async function rewardOwner(sellerId: string, amount: number, description: string, type: TransactionType): Promise<Wallet> {
  return walletService.earnCoins(sellerId, amount, description, type);
}

export interface PurchaseFactResult {
  buyerWallet: Wallet;
  sellerEarnings: number;
  pricePaid: number;
  purchase: FactPurchase;
  fact: Fact;
}

export interface PurchasePhotoResult {
  buyerWallet: Wallet;
  sellerEarnings: number;
  pricePaid: number;
  purchase: PhotoPurchase;
  photo: ProfilePhoto;
}

export const economyService = {
  async purchaseFact(buyerId: string, factId: string, buyerName: string, authorName: string): Promise<PurchaseFactResult> {
    const fact = db.facts.find((f) => f.id === factId);
    if (!fact) throw new Error('Факт не найден');
    if (fact.price === 0) throw new Error('Этот факт уже открыт');
    if (fact.authorId === buyerId) throw new Error('Это твой собственный факт');

    const alreadyUnlocked = await factService.isUnlockedForUser(factId, buyerId);
    if (alreadyUnlocked) throw new Error('Факт уже открыт');

    const pricePaid = computeCurrentPrice(fact.price, fact.unlockCount);

    const buyerWallet = await walletService.spendCoins(
      buyerId,
      pricePaid,
      `Ты открыл факт ${authorName}`,
      'fact_purchase',
    );

    const sellerEarnings = sellerCut(pricePaid);
    await rewardOwner(fact.authorId, sellerEarnings, `${buyerName} открыл(а) твой факт`, 'fact_sale');

    fact.unlockCount += 1;

    const purchase: FactPurchase = {
      id: createId('fp'),
      factId,
      buyerId,
      sellerId: fact.authorId,
      price: pricePaid,
      sellerEarnings,
      createdAt: isoNow(),
    };
    db.purchases.push(purchase);

    return delay({ buyerWallet, sellerEarnings, pricePaid, purchase, fact: { ...fact } });
  },

  async purchasePhoto(buyerId: string, photoId: string, buyerName: string, authorName: string): Promise<PurchasePhotoResult> {
    const photo = db.photos.find((p) => p.id === photoId);
    if (!photo) throw new Error('Фото не найдено');
    if (photo.price === 0) throw new Error('Это фото уже открыто');
    if (photo.ownerId === buyerId) throw new Error('Это твоё собственное фото');

    const alreadyUnlocked = await photoService.isUnlockedForUser(photoId, buyerId);
    if (alreadyUnlocked) throw new Error('Фото уже открыто');

    const pricePaid = computeCurrentPrice(photo.price, photo.unlockCount);

    const buyerWallet = await walletService.spendCoins(
      buyerId,
      pricePaid,
      `Ты открыл фото ${authorName}`,
      'photo_purchase',
    );

    const sellerEarnings = sellerCut(pricePaid);
    await rewardOwner(photo.ownerId, sellerEarnings, `${buyerName} открыл(а) твоё фото`, 'photo_sale');

    photo.unlockCount += 1;

    const purchase: PhotoPurchase = {
      id: createId('pp'),
      photoId,
      buyerId,
      sellerId: photo.ownerId,
      price: pricePaid,
      sellerEarnings,
      createdAt: isoNow(),
    };
    db.photoPurchases.push(purchase);

    return delay({ buyerWallet, sellerEarnings, pricePaid, purchase, photo: { ...photo } });
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
    await rewardOwner(fact.authorId, reward, `${buyerName} задал(а) тебе вопрос`, 'question_reward');

    const conversation = await chatService.sendMessageTo(fact.authorId, buyerId, questionText);

    return delay({ wallet, conversationId: conversation.id });
  },

  /** Spend coins to learn who's behind an interest teaser (see teaserService). */
  async revealTeaserCost(): Promise<number> {
    return REVEAL_INTEREST_PRICE;
  },

  async spendOnReveal(userId: string, description: string): Promise<Wallet> {
    return walletService.spendCoins(userId, REVEAL_INTEREST_PRICE, description, 'reveal_interest');
  },
};
