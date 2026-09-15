import { User } from '../models';
import { db, delay } from './localDatabase';
import { CURRENT_USER_ID } from '../data/users';

export const userService = {
  async getUsers(): Promise<User[]> {
    return delay([...db.users]);
  },

  async getOtherUsers(): Promise<User[]> {
    return delay(db.users.filter((u) => u.id !== CURRENT_USER_ID));
  },

  async getUserById(id: string): Promise<User | undefined> {
    return delay(db.users.find((u) => u.id === id));
  },

  async getCurrentUser(): Promise<User> {
    const user = db.users.find((u) => u.id === CURRENT_USER_ID);
    if (!user) throw new Error('Current user not seeded');
    return delay(user);
  },

  async updateBio(userId: string, bio: string): Promise<User> {
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.bio = bio;
    return delay(user);
  },
};
