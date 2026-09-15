import { create } from 'zustand';
import { AppNotification } from '../models';
import { notificationsCenterService } from '../services';

interface NotificationsState {
  notifications: AppNotification[];
  load: () => Promise<void>;
  push: (icon: string, title: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],

  load: async () => {
    const notifications = await notificationsCenterService.getAll();
    set({ notifications });
  },

  push: async (icon, title) => {
    await notificationsCenterService.add(icon, title);
    await get().load();
  },

  markAllRead: async () => {
    await notificationsCenterService.markAllRead();
    await get().load();
  },
}));
