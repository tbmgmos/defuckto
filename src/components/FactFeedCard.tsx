import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { FACT_CATEGORIES } from '../data/factCategories';
import { Fact, User } from '../models';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { VerifiedBadge } from './VerifiedBadge';
import { VoiceFactPlayer } from './VoiceFactPlayer';
import { computeCurrentPrice } from '../services/economyService';

interface FactFeedCardProps {
  fact: Fact;
  author: User;
  locked: boolean;
  onOpenProfile: () => void;
  onUnlock: () => void;
  unlocking?: boolean;
}

export function FactFeedCard({ fact, author, locked, onOpenProfile, onUnlock, unlocking }: FactFeedCardProps) {
  const category = FACT_CATEGORIES[fact.category];
  const price = computeCurrentPrice(fact.price, fact.unlockCount);
  const isVoice = fact.type === 'voice';

  return (
    <Card onPress={onOpenProfile} accessibilityLabel={`Профиль ${author.name}`}>
      <View style={styles.header}>
        <Avatar seed={author.photoSeed} name={author.name} size={36} />
        <Text style={styles.author}>
          {category.emoji} {author.name}
        </Text>
        {author.verified ? <VerifiedBadge /> : null}
        {isVoice ? <Text style={styles.voiceTag}>🎙️ голос</Text> : null}
      </View>

      {!locked && isVoice && fact.audioUri ? (
        <View style={styles.voicePlayerWrap}>
          <VoiceFactPlayer uri={fact.audioUri} durationSec={fact.durationSec ?? 0} />
        </View>
      ) : (
        <Text style={[typography.body, styles.text]} numberOfLines={locked ? 2 : undefined}>
          {locked ? maskFact(fact.text) : fact.text}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.price}>{locked ? `${price} 🪙` : 'Открыто'}</Text>
        {locked ? (
          <Button
            label={unlocking ? 'Открываем…' : 'Открыть'}
            onPress={onUnlock}
            variant="primary"
            size="md"
            disabled={unlocking}
          />
        ) : null}
      </View>
    </Card>
  );
}

// A locked feed card still needs to look tempting — a soft blur stand-in
// (we don't have a real blur here) that keeps the shape of the sentence
// without giving away the payoff.
function maskFact(text: string): string {
  return text.replace(/\S/g, (ch) => (ch === ' ' ? ' ' : '•'));
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  author: {
    ...typography.bodyMedium,
  },
  voiceTag: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    marginLeft: 'auto',
  },
  voicePlayerWrap: {
    marginBottom: spacing.md,
  },
  text: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    ...typography.headline,
    color: colors.accentText,
  },
});
