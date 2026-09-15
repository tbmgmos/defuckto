import { create } from 'zustand';
import { Transaction, Wallet } from '../models';
import { walletService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  isLoading: boolean;
  load: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  transactions: [],
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const [wallet, transactions] = await Promise.all([
      walletService.getWallet(CURRENT_USER_ID),
      walletService.getTransactions(CURRENT_USER_ID),
    ]);
    set({ wallet, transactions, isLoading: false });
  },
}));
