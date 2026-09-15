import { create } from 'zustand';
import { User } from '../models';
import { userService } from '../services';

interface UsersState {
  users: User[];
  currentUser: User | null;
  exploredIds: Set<string>;
  isLoading: boolean;
  load: () => Promise<void>;
  markExplored: (userId: string) => boolean; // returns true the first time a profile is explored
  setBio: (bio: string) => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  currentUser: null,
  exploredIds: new Set(),
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const [users, currentUser] = await Promise.all([
      userService.getOtherUsers(),
      userService.getCurrentUser(),
    ]);
    set({ users, currentUser, isLoading: false });
  },

  markExplored: (userId) => {
    if (get().exploredIds.has(userId)) return false;
    const next = new Set(get().exploredIds);
    next.add(userId);
    set({ exploredIds: next });
    return true;
  },

  setBio: (bio) => {
    const current = get().currentUser;
    if (!current) return;
    set({ currentUser: { ...current, bio } });
  },
}));
