import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Quest } from '../models';

interface DailyQuestsProps {
  quests: Quest[];
}

export function DailyQuests({ quests }: DailyQuestsProps) {
  if (quests.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={typography.eyebrow}>Сегодня</Text>
      <View style={styles.list}>
        {quests.map((q) => (
          <View key={q.key} style={styles.row}>
            <View style={styles.checkWrap}>
              <Text style={[styles.check, q.completed && styles.checkDone]}>{q.completed ? '✓' : ''}</Text>
            </View>
            <Text style={[typography.body, styles.title, q.completed && styles.titleDone]} numberOfLines={1}>
              {q.title}
            </Text>
            <Text style={[styles.reward, q.completed && styles.rewardDone]}>
              {q.completed ? 'готово' : `+${q.reward} 🪙`}
            </Text>
          </View>
        ))}
      </View>
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
  check: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 13,
  },
  checkDone: {
    color: colors.success,
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
