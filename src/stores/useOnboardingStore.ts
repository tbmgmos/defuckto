import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'defuckto.onboardingComplete';

interface OnboardingState {
  /** null while we haven't checked storage yet — avoids a flash of onboarding. */
  hasCompletedOnboarding: boolean | null;
  isFirstLaunch: boolean;
  checkStatus: () => Promise<void>;
  complete: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: null,
  isFirstLaunch: false,

  checkStatus: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({ hasCompletedOnboarding: value === 'true', isFirstLaunch: value !== 'true' });
    } catch {
      set({ hasCompletedOnboarding: false, isFirstLaunch: true });
    }
  },

  complete: async () => {
    set({ hasCompletedOnboarding: true });
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Non-fatal in a demo — worst case onboarding reappears next launch.
    }
  },
}));
