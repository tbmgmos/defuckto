import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { User } from '../models';
import { PhotoHero } from './PhotoHero';
import { Button } from './Button';
import { interestLabel } from '../data/interests';

interface DiscoveryCardProps {
  user: User;
  unlockedFactsCount: number;
  onPress: () => void;
}

export function DiscoveryCard({ user, unlockedFactsCount, onPress }: DiscoveryCardProps) {
  return (
    <View style={styles.container}>
      <PhotoHero seed={user.photoSeed} name={user.name} height={420}>
        <Text style={styles.name}>{user.name.toUpperCase()}</Text>
        <Text style={styles.meta}>
          {user.age} · {user.city}
        </Text>
        <Text style={styles.interests}>{user.interests.map(interestLabel).join(' · ')}</Text>
        {unlockedFactsCount > 0 ? (
          <Text style={styles.unlocked}>{unlockedFactsCount} факта уже открыто</Text>
        ) : null}
        <Button label="Исследовать профиль" onPress={onPress} size="lg" fullWidth style={styles.cta} />
      </PhotoHero>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  unlocked: {
    ...typography.caption,
    color: colors.accentText,
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: spacing.xs,
  },
  cta: {
    marginTop: spacing.md,
  },
});
