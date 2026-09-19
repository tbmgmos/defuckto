import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'defuckto.onboardingComplete';
const TOUR_KEY = 'defuckto.tourSeen';

interface OnboardingState {
  /** null while we haven't checked storage yet — avoids a flash of onboarding. */
  hasCompletedOnboarding: boolean | null;
  isFirstLaunch: boolean;
  /** The one-time walkthrough over the main screen (see WelcomeTour). */
  tourSeen: boolean;
  checkStatus: () => Promise<void>;
  complete: () => Promise<void>;
  markTourSeen: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: null,
  isFirstLaunch: false,
  tourSeen: true,

  checkStatus: async () => {
    try {
      const [value, tour] = await Promise.all([AsyncStorage.getItem(ONBOARDING_KEY), AsyncStorage.getItem(TOUR_KEY)]);
      set({ hasCompletedOnboarding: value === 'true', isFirstLaunch: value !== 'true', tourSeen: tour === 'true' });
    } catch {
      set({ hasCompletedOnboarding: false, isFirstLaunch: true, tourSeen: false });
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

  markTourSeen: async () => {
    set({ tourSeen: true });
    try {
      await AsyncStorage.setItem(TOUR_KEY, 'true');
    } catch {
      // Non-fatal — the walkthrough just shows once more next launch.
    }
  },
}));
