import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { CoinGlyph } from './CoinGlyph';
import { haptics } from '../utils/haptics';

type Tone = 'go' | 'hot' | 'muted';

interface FactActionButtonProps {
  label: string;
  tone: Tone;
  /** Shows a coin price and a lock — this action costs coins. */
  price?: number;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accessibilityLabel?: string;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  go: { bg: colors.success, fg: colors.textInverse },
  hot: { bg: colors.danger, fg: colors.textInverse },
  muted: { bg: colors.surfaceAlt, fg: colors.textPrimary },
};

/** A full-width action on a profile: «еще факт», «горячий факт», «написать»… */
export function FactActionButton({ label, tone, price, icon, onPress, accessibilityLabel }: FactActionButtonProps) {
  const { bg, fg } = TONES[tone];
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (price ? `${label}, ${price} монет` : label)}
      style={({ pressed }) => [styles.button, { backgroundColor: bg }, pressed && styles.pressed]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      <View style={styles.trailing}>
        {price ? (
          <>
            <Text style={[styles.price, { color: fg }]}>
              {price} <CoinGlyph size={12} color={fg} />
            </Text>
            <Ionicons name="lock-closed" size={15} color={fg} />
          </>
        ) : icon ? (
          <Ionicons name={icon} size={17} color={fg} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.min + 8,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  trailing: {
    position: 'absolute',
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    ...typography.subhead,
    fontWeight: '700',
  },
});
