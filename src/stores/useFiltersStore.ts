import { create } from 'zustand';
import { DiscoveryFilters, Gender, InterestKey } from '../models';
import { DEFAULT_FILTERS } from '../services/discoveryService';

type FlagKey = 'onlyTop' | 'onlyCompatible' | 'onlyVerified' | 'onlyHot' | 'onlyFriendship';

interface FiltersState {
  filters: DiscoveryFilters;
  setAgeRange: (minAge: number, maxAge: number) => void;
  setGender: (gender: Gender | null) => void;
  setCity: (city: string | null) => void;
  toggleInterest: (interest: InterestKey) => void;
  toggleFlag: (flag: FlagKey) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  filters: DEFAULT_FILTERS,

  setAgeRange: (minAge, maxAge) => set({ filters: { ...get().filters, minAge, maxAge } }),

  setGender: (gender) => set({ filters: { ...get().filters, gender } }),

  setCity: (city) => set({ filters: { ...get().filters, city } }),

  toggleInterest: (interest) => {
    const current = get().filters.interests;
    const interests = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    set({ filters: { ...get().filters, interests } });
  },

  toggleFlag: (flag) => set({ filters: { ...get().filters, [flag]: !get().filters[flag] } }),

  reset: () => set({ filters: DEFAULT_FILTERS }),
}));
