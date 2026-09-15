import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { Quest, StreakState } from '../models';
import { streakBonus } from '../services/streakService';
import { CoinGlyph } from './CoinGlyph';
import { dayWord } from '../utils/pluralize';

interface DailyQuestsProps {
  quests: Quest[];
  streak?: StreakState | null;
}

export function DailyQuests({ quests, streak }: DailyQuestsProps) {
  const hasStreak = !!streak && streak.currentStreak > 0;
  if (quests.length === 0 && !hasStreak) return null;

  return (
    <View style={styles.container}>
      {hasStreak ? (
        <>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={18} color={colors.accentText} />
            <Text style={styles.streakText}>
              {streak!.currentStreak} {dayWord(streak!.currentStreak)} подряд
            </Text>
            <Text style={styles.streakReward}>
              +{streakBonus(streak!.currentStreak + 1)} <CoinGlyph size={11} />
            </Text>
          </View>
          {quests.length > 0 ? <View style={styles.divider} /> : null}
        </>
      ) : null}

      {quests.length > 0 ? (
        <>
          <Text style={typography.eyebrow}>Сегодня</Text>
          <View style={styles.list}>
            {quests.map((q) => (
              <View key={q.key} style={styles.row}>
                <View style={styles.checkWrap}>
                  {q.completed ? <Ionicons name="checkmark" size={14} color={colors.success} /> : null}
                </View>
                <Text style={[typography.body, styles.title, q.completed && styles.titleDone]} numberOfLines={1}>
                  {q.title}
                </Text>
                <Text style={[styles.reward, q.completed && styles.rewardDone]}>
                  {q.completed ? (
                    'готово'
                  ) : (
                    <>
                      +{q.reward} <CoinGlyph size={11} />
                    </>
                  )}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    ...typography.bodyMedium,
    flex: 1,
  },
  streakReward: {
    ...typography.subhead,
    color: colors.accentText,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
  titleDone: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  reward: {
    ...typography.subhead,
    color: colors.accentText,
    fontWeight: '700',
  },
  rewardDone: {
    color: colors.success,
  },
});
