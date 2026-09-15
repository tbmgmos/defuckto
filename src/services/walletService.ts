import { Transaction, TransactionType, Wallet } from '../models';
import { db, delay } from './localDatabase';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

function getOrCreateWallet(userId: string): Wallet {
  let wallet = db.wallets.get(userId);
  if (!wallet) {
    wallet = { userId, balance: 0 };
    db.wallets.set(userId, wallet);
  }
  return wallet;
}

function addTransaction(userId: string, type: TransactionType, amount: number, description: string): Transaction {
  const tx: Transaction = {
    id: createId('tx'),
    userId,
    type,
    amount,
    description,
    createdAt: isoNow(),
  };
  db.transactions.unshift(tx);
  return tx;
}

export const walletService = {
  async getWallet(userId: string): Promise<Wallet> {
    return delay({ ...getOrCreateWallet(userId) });
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    return delay(db.transactions.filter((t) => t.userId === userId));
  },

  /** Deduct coins from a user. Throws if the balance would go negative. */
  async spendCoins(userId: string, amount: number, description: string, type: TransactionType): Promise<Wallet> {
    const wallet = getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      throw new Error('Недостаточно монет');
    }
    wallet.balance -= amount;
    addTransaction(userId, type, -amount, description);
    return delay({ ...wallet });
  },

  /** Credit coins to a user. */
  async earnCoins(userId: string, amount: number, description: string, type: TransactionType): Promise<Wallet> {
    const wallet = getOrCreateWallet(userId);
    wallet.balance += amount;
    addTransaction(userId, type, amount, description);
    return delay({ ...wallet });
  },
};
