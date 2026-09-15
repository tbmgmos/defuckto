import { create } from 'zustand';
import { DiscoveryFilters, InterestKey } from '../models';

const DEFAULT_FILTERS: DiscoveryFilters = {
  minAge: 18,
  maxAge: 45,
  city: null,
  interests: [],
};

interface FiltersState {
  filters: DiscoveryFilters;
  setAgeRange: (minAge: number, maxAge: number) => void;
  setCity: (city: string | null) => void;
  toggleInterest: (interest: InterestKey) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  filters: DEFAULT_FILTERS,

  setAgeRange: (minAge, maxAge) => set({ filters: { ...get().filters, minAge, maxAge } }),

  setCity: (city) => set({ filters: { ...get().filters, city } }),

  toggleInterest: (interest) => {
    const current = get().filters.interests;
    const interests = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    set({ filters: { ...get().filters, interests } });
  },

  reset: () => set({ filters: DEFAULT_FILTERS }),
}));
