import { create } from 'zustand';
import { MutualInterestEvent } from '../models';

interface InterestState {
  pendingEvent: MutualInterestEvent | null;
  show: (event: MutualInterestEvent) => void;
  dismiss: () => void;
}

export const useInterestStore = create<InterestState>((set) => ({
  pendingEvent: null,
  show: (event) => set({ pendingEvent: event }),
  dismiss: () => set({ pendingEvent: null }),
}));
