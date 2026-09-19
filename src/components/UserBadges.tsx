import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { User } from '../models';
import { useTopStore } from '../stores/useTopStore';
import { useFactsStore } from '../stores/useFactsStore';

interface UserBadgesProps {
  user: User;
  size?: number;
}

/** Verified, hot facts, weekly star and ТОП — the small marks next to a name. */
export function UserBadges({ user, size = 16 }: UserBadgesProps) {
  const isTop = useTopStore((s) => s.placements.some((p) => p.userId === user.id));
  const isStar = useTopStore((s) => s.starIds.has(user.id));
  const hasHot = useFactsStore((s) =>
    s.facts.some((f) => f.authorId === user.id && f.hot && f.moderationStatus === 'approved'),
  );

  return (
    <View style={styles.row}>
      {user.verified ? (
        <Ionicons name="checkmark-circle" size={size} color={colors.success} accessibilityLabel="Профиль верифицирован" />
      ) : null}
      {hasHot ? <Ionicons name="flame" size={size} color={colors.danger} accessibilityLabel="Есть горячие факты" /> : null}
      {isStar ? <Ionicons name="star" size={size} color={colors.warning} accessibilityLabel="Звезда недели" /> : null}
      {isTop ? (
        <View style={styles.topPill} accessibilityLabel="В ТОП 100">
          <Text style={[styles.topText, { fontSize: Math.max(9, size * 0.6) }]}>ТОП</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  topPill: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  topText: {
    color: colors.accentText,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
