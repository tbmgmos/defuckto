import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Tone = 'accent' | 'neutral' | 'success' | 'locked';

interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: string;
  style?: ViewStyle;
}

const toneStyles: Record<Tone, { bg: string; text: string }> = {
  accent: { bg: colors.accentMuted, text: colors.accentText },
  neutral: { bg: colors.surfaceAlt, text: colors.textSecondary },
  success: { bg: colors.successMuted, text: colors.success },
  locked: { bg: colors.overlaySoft, text: colors.textSecondary },
};

export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.container, { backgroundColor: t.bg }, style]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, { color: t.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 13,
  },
  label: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
