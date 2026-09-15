import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { FACT_CATEGORIES } from '../data/factCategories';
import { Fact } from '../models';
import { Button } from './Button';

interface FactCardProps {
  fact: Fact;
  locked: boolean;
  onUnlock: () => void;
  unlocking?: boolean;
}

/**
 * A single fact row on a profile screen: locked shows the price + CTA,
 * unlocked reveals the text with a short pop-in animation the moment
 * `locked` flips to false (see spec §13 — "раскрытие факта").
 */
export function FactCard({ fact, locked, onUnlock, unlocking }: FactCardProps) {
  const reveal = useRef(new Animated.Value(locked ? 0 : 1)).current;
  const category = FACT_CATEGORIES[fact.category];

  useEffect(() => {
    if (!locked) {
      reveal.setValue(0);
      Animated.spring(reveal, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 9 }).start();
    }
  }, [locked, reveal]);

  return (
    <View style={[styles.container, locked && styles.containerLocked]}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{locked ? '🔒' : category.emoji}</Text>
        <View style={styles.body}>
          {locked ? (
            <>
              <Text style={styles.lockedHint}>{category.label} · закрытый факт</Text>
              <Text style={styles.priceLabel}>{fact.price} 🪙</Text>
            </>
          ) : (
            <Animated.Text
              style={[
                typography.body,
                styles.text,
                {
                  opacity: reveal,
                  transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
                },
              ]}
            >
              {fact.text}
            </Animated.Text>
          )}
        </View>
      </View>
      {locked ? (
        <Button
          label={unlocking ? 'Открываем…' : `Открыть за ${fact.price} 🪙`}
          onPress={onUnlock}
          variant="secondary"
          disabled={unlocking}
          style={styles.cta}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  containerLocked: {
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 22,
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  text: {
    color: colors.textPrimary,
  },
  lockedHint: {
    ...typography.subhead,
  },
  priceLabel: {
    ...typography.headline,
    color: colors.accentText,
  },
  cta: {
    alignSelf: 'flex-start',
  },
});
