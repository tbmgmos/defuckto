import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { Quest, StreakState } from '../models';
import { DailyQuests } from './DailyQuests';
import { CoinGlyph } from './CoinGlyph';
import { Button } from './Button';

interface EarnCoinsPanelProps {
  quests: Quest[];
  streak?: StreakState | null;
  onBuyCoins: () => void;
}

/** «ПОЛУЧИТЬ +N» — collapsed shows what's still up for grabs today, expanded shows the daily quests. */
export function EarnCoinsPanel({ quests, streak, onBuyCoins }: EarnCoinsPanelProps) {
  const [open, setOpen] = useState(false);
  const available = quests.filter((q) => !q.completed).reduce((sum, q) => sum + q.reward, 0);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.button}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={available > 0 ? `Получить монеты: ещё ${available} за задания` : 'Ежедневные задания'}
      >
        <Text style={styles.label}>{available > 0 ? 'ПОЛУЧИТЬ' : 'ЗАДАНИЯ НА СЕГОДНЯ'}</Text>
        {available > 0 ? (
          <Text style={styles.amount}>
            +{available} <CoinGlyph size={12} color={colors.accentText} />
          </Text>
        ) : null}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
      </Pressable>

      {open ? (
        <View style={styles.expanded}>
          <DailyQuests quests={quests} streak={streak} />
          <Button
            label="Купить монеты"
            onPress={onBuyCoins}
            variant="secondary"
            fullWidth
            style={styles.buy}
            icon={<Ionicons name="add-circle-outline" size={18} color={colors.textPrimary} />}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.min,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  amount: {
    ...typography.subhead,
    color: colors.accentText,
    fontWeight: '800',
  },
  expanded: {
    marginBottom: spacing.xs,
  },
  buy: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
});
