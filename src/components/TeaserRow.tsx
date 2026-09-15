import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { InterestTeaser } from '../models';
import { getUserById } from '../data/users';
import { REVEAL_INTEREST_PRICE } from '../services/economyService';
import { formatRelativeTime } from '../utils/date';

interface TeaserRowProps {
  teaser: InterestTeaser;
  onReveal: () => void;
  onOpenProfile: () => void;
  revealing?: boolean;
}

export function TeaserRow({ teaser, onReveal, onOpenProfile, revealing }: TeaserRowProps) {
  const curious = teaser.revealed ? getUserById(teaser.curiousUserId) : null;

  const body = (
    <>
      <View style={styles.textRow}>
        <Text style={styles.emoji}>👀</Text>
        <View style={styles.textCol}>
          <Text style={typography.body}>
            {teaser.revealed ? `${curious?.name ?? 'Кто-то'} заинтересовал(ась) твоим фактом` : 'Кто-то заинтересовался твоим фактом'}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(teaser.createdAt)}</Text>
        </View>
        {teaser.revealed ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
      </View>
      {!teaser.revealed ? (
        <Button
          label={revealing ? 'Узнаём…' : `Узнать · ${REVEAL_INTEREST_PRICE} 🪙`}
          onPress={onReveal}
          variant="secondary"
          size="md"
          disabled={revealing}
          fullWidth
          style={styles.revealButton}
        />
      ) : null}
    </>
  );

  // Only tappable-through-to-a-profile once there's a real person to show —
  // revealing is still gated behind the button above, not the row itself.
  if (teaser.revealed) {
    return (
      <Pressable
        onPress={onOpenProfile}
        style={styles.container}
        accessibilityRole="button"
        accessibilityLabel={`Открыть профиль ${curious?.name ?? ''}`}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={styles.container}>{body}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  textCol: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  time: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
  revealButton: {
    alignSelf: 'stretch',
  },
});
