import { ProfilePhoto } from '../models';
import { db, delay } from './localDatabase';

export const photoService = {
  async getAllPhotos(): Promise<ProfilePhoto[]> {
    return delay([...db.photos]);
  },

  async getPhotosByOwner(ownerId: string): Promise<ProfilePhoto[]> {
    return delay(db.photos.filter((p) => p.ownerId === ownerId));
  },

  async getPhotoById(id: string): Promise<ProfilePhoto | undefined> {
    return delay(db.photos.find((p) => p.id === id));
  },

  async isUnlockedForUser(photoId: string, userId: string): Promise<boolean> {
    const photo = db.photos.find((p) => p.id === photoId);
    if (!photo) return false;
    if (photo.price === 0) return true;
    if (photo.ownerId === userId) return true;
    return db.photoPurchases.some((p) => p.photoId === photoId && p.buyerId === userId);
  },

  async getUnlockedPhotoIds(userId: string): Promise<Set<string>> {
    const unlocked = new Set<string>();
    db.photos.forEach((p) => {
      if (p.price === 0 || p.ownerId === userId) unlocked.add(p.id);
    });
    db.photoPurchases.filter((p) => p.buyerId === userId).forEach((p) => unlocked.add(p.photoId));
    return delay(unlocked);
  },
};
