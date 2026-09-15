import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// expo-haptics throws on web — every call here is fire-and-forget and safe
// to sprinkle liberally through screens.
function safe(fn: () => Promise<void> | void) {
  if (Platform.OS === 'web') return;
  try {
    void fn();
  } catch {
    // no-op — haptics are a nicety, never worth crashing a screen over
  }
}

export const haptics = {
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  press: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  select: () => safe(() => Haptics.selectionAsync()),
};
