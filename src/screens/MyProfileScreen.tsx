import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { PhotoHero } from '../components/PhotoHero';
import { Badge } from '../components/Badge';
import { StatTile } from '../components/StatTile';
import { Button } from '../components/Button';
import { CoinBalance } from '../components/CoinBalance';
import { useUsersStore } from '../stores/useUsersStore';
import { useFactsStore } from '../stores/useFactsStore';
import { useWalletStore } from '../stores/useWalletStore';
import { statsService, ProfileStats } from '../services/statsService';
import { interestLabel } from '../data/interests';
import { FACT_CATEGORIES } from '../data/factCategories';
import { CURRENT_USER_ID } from '../data/users';
import { colors, spacing, typography } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MyProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const currentUser = useUsersStore((s) => s.currentUser);
  const allFacts = useFactsStore((s) => s.facts);
  const myFacts = useMemo(() => allFacts.filter((f) => f.authorId === CURRENT_USER_ID), [allFacts]);
  const balance = useWalletStore((s) => s.wallet?.balance ?? 0);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      statsService.getProfileStats(CURRENT_USER_ID).then((s) => {
        if (active) setStats(s);
      });
      return () => {
        active = false;
      };
    }, [myFacts.length, balance]),
  );

  if (!currentUser) return null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PhotoHero seed={currentUser.photoSeed} name={currentUser.name} height={320} borderRadius={0}>
        <View style={[styles.balanceChip, { top: insets.top + 12 }]}>
          <CoinBalance balance={balance} size="sm" onPress={() => navigation.navigate('Wallet')} />
        </View>
      </PhotoHero>

      <View style={styles.body}>
        <Text style={typography.title1}>{currentUser.name}</Text>
        <Text style={styles.meta}>
          {currentUser.age} · {currentUser.city}
        </Text>
        <View style={styles.interestsRow}>
          {currentUser.interests.map((i) => (
            <Badge key={i} label={interestLabel(i)} tone="neutral" />
          ))}
        </View>
        <Text style={[typography.body, styles.bio]}>{currentUser.bio}</Text>

        {stats ? (
          <View style={styles.statsRow}>
            <StatTile value={String(stats.factsOpenedByOthers)} label="Фактов открыли" />
            <StatTile value={String(stats.factsUnlockedByUser)} label="Фактов открыто" />
            <StatTile value={`${stats.likePercentage}%`} label="Факты понравились" />
          </View>
        ) : null}

        <View style={styles.sectionHeaderRow}>
          <Text style={typography.eyebrow}>Мои факты</Text>
        </View>

        <View style={styles.factsList}>
          {myFacts.map((fact) => {
            const meta = FACT_CATEGORIES[fact.category];
            return (
              <View key={fact.id} style={styles.factRow}>
                <Text style={styles.factEmoji}>{fact.price === 0 ? meta.emoji : '🔒'}</Text>
                <Text style={[typography.body, styles.factText]}>{fact.text}</Text>
                {fact.price > 0 ? <Text style={styles.factPrice}>{fact.price} 🪙</Text> : null}
              </View>
            );
          })}
        </View>

        <Button label="+ Добавить факт" onPress={() => navigation.navigate('AddFact')} variant="secondary" fullWidth style={styles.addButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  balanceChip: {
    position: 'absolute',
    right: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  meta: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  bio: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  sectionHeaderRow: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  factsList: {
    gap: spacing.sm,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  factEmoji: {
    fontSize: 20,
  },
  factText: {
    flex: 1,
  },
  factPrice: {
    ...typography.subhead,
    color: colors.accentText,
    fontWeight: '700',
  },
  addButton: {
    marginTop: spacing.lg,
  },
});
