import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/types';
import { PhotoHero } from '../components/PhotoHero';
import { Badge } from '../components/Badge';
import { StatTile } from '../components/StatTile';
import { Button } from '../components/Button';
import { CoinBalance } from '../components/CoinBalance';
import { CoinGlyph } from '../components/CoinGlyph';
import { UserBadges } from '../components/UserBadges';
import { VerificationSheet } from '../components/VerificationSheet';
import { PaywallSheet } from '../components/PaywallSheet';
import { ReferralSheet } from '../components/ReferralSheet';
import { PhotoPickerSheet } from '../components/PhotoPickerSheet';
import { EditBioSheet } from '../components/EditBioSheet';
import { useUsersStore } from '../stores/useUsersStore';
import { useFactsStore } from '../stores/useFactsStore';
import { useWalletStore } from '../stores/useWalletStore';
import { usePremiumStore } from '../stores/usePremiumStore';
import { statsService, ProfileStats } from '../services/statsService';
import { referralService } from '../services/referralService';
import { submitVerification, redeemReferral, activatePremium, updateProfilePhoto, removeProfilePhoto, updateBio } from '../stores/actions';
import { interestLabel } from '../data/interests';
import { FACT_CATEGORIES } from '../data/factCategories';
import { CURRENT_USER_ID } from '../data/users';
import { colors, radius, spacing, typography } from '../theme';
import { computeCurrentPrice } from '../services/economyService';
import { ReferralInfo } from '../models';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

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
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [bioSheetOpen, setBioSheetOpen] = useState(false);

  const pickPhotoFromCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Нет доступа к камере', 'Разреши доступ к камере в настройках устройства.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await updateProfilePhoto(result.assets[0].uri);
    }
  }, []);

  const pickPhotoFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Нет доступа к галерее', 'Разреши доступ к фото в настройках устройства.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await updateProfilePhoto(result.assets[0].uri);
    }
  }, []);

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
        photoUri={currentUser.photoUri}
        height={320}
        borderRadius={0}
        fillOverlay={
          <>
            <Pressable
              onPress={navigation.goBack}
              style={[styles.backButton, { top: insets.top + 12 }]}
              accessibilityRole="button"
              accessibilityLabel="Назад"
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <View style={[styles.balanceChip, { top: insets.top + 12 }]}>
              <CoinBalance balance={balance} size="sm" onPress={() => navigation.navigate('Wallet')} />
            </View>
            <Pressable
              style={styles.editPhotoButton}
              onPress={() => setPhotoPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Изменить фото профиля"
              hitSlop={8}
            >
              <Ionicons name="camera" size={18} color={colors.textPrimary} />
            </Pressable>
          </>
        }
      />

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={typography.title1}>{currentUser.name}</Text>
          <UserBadges user={currentUser} size={18} />
        </View>
        <Text style={styles.meta}>
          {currentUser.age} · {currentUser.city}
        </Text>
        <View style={styles.interestsRow}>
          {currentUser.interests.map((i) => (
            <Badge key={i} label={interestLabel(i)} tone="neutral" />
          ))}
        </View>
        <Pressable
          style={styles.bioRow}
          onPress={() => setBioSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Редактировать о себе"
        >
          <Text style={[typography.body, styles.bio]}>{currentUser.bio}</Text>
          <Ionicons name="pencil-outline" size={15} color={colors.textTertiary} style={styles.bioIcon} />
        </Pressable>

        <View style={styles.actionsRow}>
          {!currentUser.verified ? (
            <Button
              label="Верифицировать"
              onPress={() => setVerifySheetOpen(true)}
              variant="secondary"
              size="md"
              icon={<Ionicons name="checkmark-circle-outline" size={17} color={colors.textPrimary} />}
            />
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
            const rowIcon =
              fact.price === 0
                ? (meta.icon as React.ComponentProps<typeof Ionicons>['name'])
                : fact.type === 'voice'
                  ? 'mic-outline'
                  : 'lock-closed-outline';
            return (
              <View key={fact.id} style={styles.factRow}>
                <Ionicons name={rowIcon} size={18} color={colors.textSecondary} />
                <Text style={[typography.body, styles.factText]}>{fact.text}</Text>
                {fact.hot ? (
                  <Ionicons
                    name="flame"
                    size={15}
                    color={colors.danger}
                    accessibilityLabel={fact.moderationStatus === 'pending' ? 'Горячий факт, на модерации' : 'Горячий факт'}
                  />
                ) : null}
                {fact.moderationStatus === 'pending' ? <Badge label="на модерации" tone="neutral" /> : null}
                {fact.price > 0 ? (
                  <Text style={styles.factPrice}>
                    {price} <CoinGlyph size={12} color={colors.accentText} />
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>

        <Button
          label="Добавить факт"
          onPress={() => navigation.navigate('AddFact')}
          variant="secondary"
          fullWidth
          style={styles.addButton}
          icon={<Ionicons name="add" size={19} color={colors.textPrimary} />}
        />
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
      <PhotoPickerSheet
        visible={photoPickerOpen}
        hasPhoto={!!currentUser.photoUri}
        onClose={() => setPhotoPickerOpen(false)}
        onPickCamera={pickPhotoFromCamera}
        onPickLibrary={pickPhotoFromLibrary}
        onRemove={removeProfilePhoto}
      />
      <EditBioSheet
        visible={bioSheetOpen}
        initialValue={currentUser.bio}
        onClose={() => setBioSheetOpen(false)}
        onSave={updateBio}
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
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayScrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceChip: {
    position: 'absolute',
    right: spacing.lg,
  },
  editPhotoButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayScrim,
    borderWidth: 1,
    borderColor: colors.border,
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
  bioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  bio: {
    flex: 1,
    color: colors.textSecondary,
  },
  bioIcon: {
    marginTop: 3,
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
