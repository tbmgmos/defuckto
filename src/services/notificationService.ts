import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Real push needs a backend to send from (explicitly out of scope, spec
// §27). What we CAN do honestly on-device: schedule a local notification
// the moment something happens in this session — "твой факт открыли"
// fires the instant it happens, not through a server round-trip. This is
// not a replacement for push (it only fires while these events occur
// locally), but it's the real API, not a fake.
let configured = false;
let permissionGranted = false;

function ensureHandler() {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    ensureHandler();
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      permissionGranted = status === 'granted';
      return permissionGranted;
    } catch {
      return false;
    }
  },

  async notify(title: string, body: string): Promise<void> {
    if (Platform.OS === 'web' || !permissionGranted) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null, // fire immediately
      });
    } catch {
      // Best-effort — a missed local notification should never break a flow.
    }
  },
};
