// Simulates the "other side" of the economy loop: other people occasionally
// unlocking one of your facts while you're using the app, so the wallet
// doesn't feel static. Nothing here is random-per-frame — the store decides
// how often to call this.

import { db, delay, SELLER_SHARE } from './localDatabase';
import { walletService } from './walletService';
import { CURRENT_USER_ID } from '../data/users';

export interface SimulatedUnlock {
  buyerName: string;
  amount: number;
  factText: string;
}

export const simulationService = {
  async maybeSimulateIncomingUnlock(): Promise<SimulatedUnlock | null> {
    const myPaidFacts = db.facts.filter((f) => f.authorId === CURRENT_USER_ID && f.price > 0);
    if (myPaidFacts.length === 0) return delay(null, 0);

    const otherUsers = db.users.filter((u) => u.id !== CURRENT_USER_ID);
    const buyer = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const fact = myPaidFacts[Math.floor(Math.random() * myPaidFacts.length)];
    const amount = Math.round(fact.price * SELLER_SHARE);

    fact.unlockCount += 1;
    await walletService.earnCoins(CURRENT_USER_ID, amount, `${buyer.name} открыл(а) твой факт`, 'fact_sale');

    return delay({ buyerName: buyer.name, amount, factText: fact.text });
  },
};
