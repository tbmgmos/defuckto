import { create } from 'zustand';
import { ProfilePhoto } from '../models';
import { photoService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

interface PhotosState {
  photos: ProfilePhoto[];
  unlockedIds: Set<string>;
  isLoading: boolean;
  load: () => Promise<void>;
  applyPhotoUpdate: (photo: ProfilePhoto) => void;
  markUnlocked: (photoId: string) => void;
}

export const usePhotosStore = create<PhotosState>((set, get) => ({
  photos: [],
  unlockedIds: new Set(),
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const [photos, unlockedIds] = await Promise.all([
      photoService.getAllPhotos(),
      photoService.getUnlockedPhotoIds(CURRENT_USER_ID),
    ]);
    set({ photos, unlockedIds, isLoading: false });
  },

  applyPhotoUpdate: (photo) => {
    set({ photos: get().photos.map((p) => (p.id === photo.id ? photo : p)) });
  },

  markUnlocked: (photoId) => {
    const next = new Set(get().unlockedIds);
    next.add(photoId);
    set({ unlockedIds: next });
  },
}));
