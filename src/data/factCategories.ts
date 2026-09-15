import { FactCategory, FactCategoryMeta } from '../models';

export const FACT_CATEGORIES: Record<FactCategory, FactCategoryMeta> = {
  music: { key: 'music', label: 'Музыка', icon: 'musical-notes-outline' },
  travel: { key: 'travel', label: 'Путешествия', icon: 'airplane-outline' },
  games: { key: 'games', label: 'Игры', icon: 'game-controller-outline' },
  weird: { key: 'weird', label: 'Странное', icon: 'planet-outline' },
  life: { key: 'life', label: 'Жизнь', icon: 'leaf-outline' },
  food: { key: 'food', label: 'Еда', icon: 'restaurant-outline' },
  other: { key: 'other', label: 'Другое', icon: 'ellipsis-horizontal' },
};

// Facts-feed filter chips (spec §16) — deliberately excludes "Другое".
export const FACT_CATEGORY_LIST: FactCategoryMeta[] = [
  FACT_CATEGORIES.music,
  FACT_CATEGORIES.travel,
  FACT_CATEGORIES.games,
  FACT_CATEGORIES.weird,
  FACT_CATEGORIES.life,
  FACT_CATEGORIES.food,
];

// "Add a fact" category picker (spec §17) — its own curated order.
export const ADD_FACT_CATEGORY_LIST: FactCategoryMeta[] = [
  FACT_CATEGORIES.music,
  FACT_CATEGORIES.travel,
  FACT_CATEGORIES.games,
  FACT_CATEGORIES.life,
  FACT_CATEGORIES.weird,
  FACT_CATEGORIES.other,
];
