// The in-app notification history (bell icon) — distinct from
// notificationService.ts, which schedules an OS-level push for the same
// events. This is what the user can scroll back through inside the app.

import { db, delay } from './localDatabase';
import { AppNotification } from '../models';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

export const notificationsCenterService = {
  async getAll(): Promise<AppNotification[]> {
    return delay([...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async add(icon: string, title: string): Promise<AppNotification> {
    const notification: AppNotification = { id: createId('notif'), icon, title, createdAt: isoNow(), read: false };
    db.notifications.unshift(notification);
    return delay(notification, 0);
  },

  async markAllRead(): Promise<void> {
    db.notifications.forEach((n) => {
      n.read = true;
    });
    return delay(undefined, 0);
  },
};
