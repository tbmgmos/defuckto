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
import { VerifiedBadge } from '../components/VerifiedBadge';
import { VerificationSheet } from '../components/VerificationSheet';
import { PaywallSheet } from '../components/PaywallSheet';
import { ReferralSheet } from '../components/ReferralSheet';
import { useUsersStore } from '../stores/useUsersStore';
import { useFactsStore } from '../stores/useFactsStore';
import { useWalletStore } from '../stores/useWalletStore';
import { usePremiumStore } from '../stores/usePremiumStore';
import { statsService, ProfileStats } from '../services/statsService';
import { referralService } from '../services/referralService';
import { submitVerification, redeemReferral, activatePremium } from '../stores/actions';
import { interestLabel } from '../data/interests';
import { FACT_CATEGORIES } from '../data/factCategories';
import { CURRENT_USER_ID } from '../data/users';
import { colors, radius, spacing, typography } from '../theme';
import { computeCurrentPrice } from '../services/economyService';
import { ReferralInfo } from '../models';

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
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [verifySheetOpen, setVerifySheetOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      statsService.getProfileStats(CURRENT_USER_ID).then((s) => {
        if (active) setStats(s);
      });
      referralService.getMyReferral(CURRENT_USER_ID).then((r) => {
        if (active) setReferral(r);
      });
      return () => {
        active = false;
      };
    }, [myFacts.length, balance]),
  );

  if (!currentUser) return null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PhotoHero
        seed={currentUser.photoSeed}
        name={currentUser.name}
        height={320}
        borderRadius={0}
        fillOverlay={
          <View style={[styles.balanceChip, { top: insets.top + 12 }]}>
            <CoinBalance balance={balance} size="sm" onPress={() => navigation.navigate('Wallet')} />
          </View>
        }
      />

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={typography.title1}>{currentUser.name}</Text>
          {currentUser.verified ? <VerifiedBadge /> : null}
        </View>
        <Text style={styles.meta}>
          {currentUser.age} · {currentUser.city}
        </Text>
        <View style={styles.interestsRow}>
          {currentUser.interests.map((i) => (
            <Badge key={i} label={interestLabel(i)} tone="neutral" />
          ))}
        </View>
        <Text style={[typography.body, styles.bio]}>{currentUser.bio}</Text>

        <View style={styles.actionsRow}>
          {!currentUser.verified ? (
            <Button label="✓ Верифицировать" onPress={() => setVerifySheetOpen(true)} variant="secondary" size="md" />
          ) : null}
          <Button label="DEFUCKTO+" onPress={() => setPaywallOpen(true)} variant={isPremium ? 'secondary' : 'primary'} size="md" />
          <Button label="Пригласить друга" onPress={() => setReferralOpen(true)} variant="secondary" size="md" />
        </View>

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
            const price = computeCurrentPrice(fact.price, fact.unlockCount);
            return (
              <View key={fact.id} style={styles.factRow}>
                <Text style={styles.factEmoji}>{fact.price === 0 ? meta.emoji : fact.type === 'voice' ? '🎙️' : '🔒'}</Text>
                <Text style={[typography.body, styles.factText]}>{fact.text}</Text>
                {fact.price > 0 ? <Text style={styles.factPrice}>{price} 🪙</Text> : null}
              </View>
            );
          })}
        </View>

        <Button label="+ Добавить факт" onPress={() => navigation.navigate('AddFact')} variant="secondary" fullWidth style={styles.addButton} />
      </View>

      <VerificationSheet
        visible={verifySheetOpen}
        onClose={() => setVerifySheetOpen(false)}
        onSubmit={submitVerification}
      />
      <PaywallSheet
        visible={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onActivate={activatePremium}
        alreadyPremium={isPremium}
      />
      <ReferralSheet
        visible={referralOpen}
        referral={referral}
        onClose={() => setReferralOpen(false)}
        onSimulateRedeem={redeemReferral}
      />
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
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
    borderRadius: radius.md,
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
