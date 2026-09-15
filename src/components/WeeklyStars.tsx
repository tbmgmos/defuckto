import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { Avatar } from './Avatar';
import { CategoryStar } from '../services/leaderboardService';
import { getUserById } from '../data/users';
import { FACT_CATEGORIES } from '../data/factCategories';

interface WeeklyStarsProps {
  stars: CategoryStar[];
  onPressAuthor: (userId: string) => void;
}

// Scoped per category on purpose — see leaderboardService: one global
// ranking would just crown the same person and demotivate everyone else.
export function WeeklyStars({ stars, onPressAuthor }: WeeklyStarsProps) {
  if (stars.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[typography.eyebrow, styles.title]}>Звёзды недели</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {stars.map((star) => {
          const author = getUserById(star.authorId);
          if (!author) return null;
          const category = FACT_CATEGORIES[star.category];
          return (
            <Pressable key={star.category} onPress={() => onPressAuthor(author.id)} style={styles.card} accessibilityRole="button">
              <Avatar seed={author.photoSeed} name={author.name} size={44} />
              <View style={styles.categoryRow}>
                <Ionicons name={category.icon as React.ComponentProps<typeof Ionicons>['name']} size={11} color={colors.textTertiary} />
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {author.name}
              </Text>
              <Text style={styles.stat}>{star.totalUnlocks} открытий</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  title: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    width: 108,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  categoryLabel: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
  name: {
    ...typography.bodyMedium,
    fontSize: 13,
  },
  stat: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.accentText,
  },
});
