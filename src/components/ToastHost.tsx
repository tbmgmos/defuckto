import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { useToastStore } from '../stores/useToastStore';

const TONE_ACCENT: Record<string, string> = {
  default: colors.textPrimary,
  success: colors.success,
  error: colors.danger,
};

/** Mount once near the app root. Reads useToastStore so any screen can call show(). */
export function ToastHost() {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6 }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => hide());
    }, 2400);

    return () => clearTimeout(timer);
  }, [toast, opacity, translateY, hide]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { bottom: insets.bottom + 88, opacity, transform: [{ translateY }] },
      ]}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: TONE_ACCENT[toast.tone] }]}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
});
