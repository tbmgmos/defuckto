import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography, touchTarget } from '../theme';
import { haptics } from '../utils/haptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  emoji?: string;
}

export function Chip({ label, selected, onPress, emoji }: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      hitSlop={4}
      style={[styles.base, selected && styles.selected]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji} </Text> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.textInverse,
  },
});
