import { create } from 'zustand';

export type ToastTone = 'default' | 'success' | 'error';

export interface ToastData {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toast: ToastData | null;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, tone = 'default') => set({ toast: { id: `${Date.now()}`, message, tone } }),
  hide: () => set({ toast: null }),
}));
