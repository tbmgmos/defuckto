import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { StreakState } from '../models';
import { streakBonus } from '../services/streakService';

interface StreakBannerProps {
  streak: StreakState | null;
}

export function StreakBanner({ streak }: StreakBannerProps) {
  if (!streak || streak.currentStreak === 0) return null;
  const nextBonus = streakBonus(streak.currentStreak + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.fire}>🔥</Text>
      <View style={styles.textCol}>
        <Text style={styles.title}>
          {streak.currentStreak} {dayWord(streak.currentStreak)} подряд
        </Text>
        <Text style={styles.subtitle}>Ещё один день — и +{nextBonus} 🪙</Text>
      </View>
    </View>
  );
}

function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня';
  return 'дней';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  fire: {
    fontSize: 26,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
  },
  subtitle: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
