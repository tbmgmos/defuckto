import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { User } from '../models';
import { PhotoHero } from './PhotoHero';
import { Button } from './Button';
import { UserBadges } from './UserBadges';
import { CompatibilityTag } from './CompatibilityTag';
import { interestLabel } from '../data/interests';

interface DiscoveryCardProps {
  user: User;
  unlockedFactsCount: number;
  sharedInterests: number;
  sparked: boolean;
  onPress: () => void;
  onSpark: () => void;
}

export function DiscoveryCard({ user, unlockedFactsCount, sharedInterests, sparked, onPress, onSpark }: DiscoveryCardProps) {
  return (
    <View style={styles.container}>
      <PhotoHero seed={user.photoSeed} name={user.name} height={420}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name.toUpperCase()}</Text>
          <UserBadges user={user} size={20} />
        </View>
        <Text style={styles.meta}>
          {user.age} · {user.city}
        </Text>
        <Text style={styles.interests}>{user.interests.map(interestLabel).join(' · ')}</Text>
        <View style={styles.tagsRow}>
          {unlockedFactsCount > 0 ? (
            <Text style={styles.unlocked}>{unlockedFactsCount} факта уже открыто</Text>
          ) : null}
          <CompatibilityTag sharedCount={sharedInterests} />
        </View>
        <View style={styles.ctaRow}>
          <Button label="Исследовать профиль" onPress={onPress} size="lg" style={styles.exploreCta} />
          <Pressable
            onPress={onSpark}
            disabled={sparked}
            style={[styles.sparkButton, sparked && styles.sparkButtonActive]}
            accessibilityRole="button"
            accessibilityLabel={sparked ? 'Интерес уже отмечен' : 'Мне интересно'}
            hitSlop={8}
          >
            <Ionicons name={sparked ? 'sparkles' : 'sparkles-outline'} size={22} color={sparked ? colors.accent : colors.textPrimary} />
          </Pressable>
        </View>
      </PhotoHero>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.display,
    fontSize: 28,
  },
  meta: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  interests: {
    ...typography.subhead,
    marginTop: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  unlocked: {
    ...typography.caption,
    color: colors.accentText,
    textTransform: 'none',
    letterSpacing: 0,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  exploreCta: {
    flex: 1,
  },
  sparkButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sparkButtonActive: {
    borderColor: colors.accent,
  },
});
