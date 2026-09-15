import { ProfilePhoto } from '../models';
import { isoDaysAgo } from '../utils/date';
import { USERS } from './users';

// Every user gets a free cover photo (price 0) plus 1-2 locked ones,
// unlockable exactly like a fact — same economy, different payload.
function photosFor(ownerId: string, lockedPrices: number[], unlockCounts: number[]): ProfilePhoto[] {
  const cover: ProfilePhoto = {
    id: `photo_${ownerId}_0`,
    ownerId,
    seed: ownerId,
    price: 0,
    unlockCount: 0,
    createdAt: isoDaysAgo(30),
  };
  const locked = lockedPrices.map((price, i) => ({
    id: `photo_${ownerId}_${i + 1}`,
    ownerId,
    seed: `${ownerId}_${i + 1}`,
    price,
    unlockCount: unlockCounts[i] ?? 0,
    createdAt: isoDaysAgo(20 - i * 5),
  }));
  return [cover, ...locked];
}

export const PHOTOS: ProfilePhoto[] = [
  ...photosFor('u_vlad', [15], [4]),
  ...photosFor('u_masha', [20, 15], [26, 19]),
  ...photosFor('u_alex', [15], [11]),
  ...photosFor('u_sofia', [25, 20], [22, 14]),
  ...photosFor('u_lena', [15], [9]),
  ...photosFor('u_timur', [20], [17]),
  ...photosFor('u_ira', [15, 15], [20, 8]),
  ...photosFor('u_danil', [15], [12]),
  ...photosFor('u_olya', [20], [10]),
];

export function getPhotosByOwner(ownerId: string): ProfilePhoto[] {
  return PHOTOS.filter((p) => p.ownerId === ownerId);
}

// Sanity check kept intentionally tiny — every user must have a free cover photo.
if (__DEV__) {
  USERS.forEach((u) => {
    if (!PHOTOS.some((p) => p.ownerId === u.id && p.price === 0)) {
      // eslint-disable-next-line no-console
      console.warn(`User ${u.id} has no free cover photo seeded`);
    }
  });
}
