import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface CoinBalanceProps {
  balance: number;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

/** Counts up/down to the new balance and gives a small pop + flash on change. */
export function CoinBalance({ balance, onPress, size = 'md' }: CoinBalanceProps) {
  const [displayValue, setDisplayValue] = useState(balance);
  const progress = useRef(new Animated.Value(balance)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const prevBalance = useRef(balance);

  useEffect(() => {
    if (prevBalance.current === balance) return;
    prevBalance.current = balance;

    const listenerId = progress.addListener(({ value }) => setDisplayValue(Math.round(value)));

    Animated.parallel([
      Animated.timing(progress, {
        toValue: balance,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.12, useNativeDriver: true, speed: 30 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }),
      ]),
    ]).start();

    return () => progress.removeListener(listenerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Баланс: ${balance} монет`}
      style={[styles.container, size === 'sm' && styles.containerSm]}
    >
      <Animated.View style={{ transform: [{ scale }], flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={[styles.value, size === 'sm' && styles.valueSm]}>{displayValue}</Text>
        <Text style={size === 'sm' ? styles.coinSm : styles.coin}>🪙</Text>
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minHeight: 40,
  },
  containerSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minHeight: 32,
  },
  value: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  valueSm: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  coin: {
    fontSize: 16,
  },
  coinSm: {
    fontSize: 13,
  },
});
