import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { FactCard } from '../components/FactCard';
import { Button } from '../components/Button';
import { PurchaseFactSheet } from '../components/PurchaseFactSheet';
import { PurchasePhotoSheet } from '../components/PurchasePhotoSheet';
import { AskQuestionSheet } from '../components/AskQuestionSheet';
import { ReportBlockSheet } from '../components/ReportBlockSheet';
import { Badge } from '../components/Badge';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { CompatibilityTag } from '../components/CompatibilityTag';
import { getUserById } from '../data/users';
import { useFactsStore } from '../stores/useFactsStore';
import { usePhotosStore } from '../stores/usePhotosStore';
import { useUsersStore } from '../stores/useUsersStore';
import { useToastStore } from '../stores/useToastStore';
import { askQuestion, blockUser, exploreProfile, openConversationWith, purchaseFact, purchasePhoto, reportFact, reportUser } from '../stores/actions';
import { interestLabel } from '../data/interests';
import { compatibilityScore } from '../utils/compatibility';
import { Fact, ProfilePhoto } from '../models';
import { economyService } from '../services';
import { CURRENT_USER_ID } from '../data/users';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

type RevealStage = 'reacted' | 'revealed';

export function UserProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const user = getUserById(userId);
  const currentUser = useUsersStore((s) => s.currentUser);
  const allFacts = useFactsStore((s) => s.facts);
  const unlockedIds = useFactsStore((s) => s.unlockedIds);
  const allPhotos = usePhotosStore((s) => s.photos);
  const unlockedPhotoIds = usePhotosStore((s) => s.unlockedIds);
  const showToast = useToastStore((s) => s.show);

  const [purchaseTarget, setPurchaseTarget] = useState<Fact | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<ProfilePhoto | null>(null);
  const [purchasingPhoto, setPurchasingPhoto] = useState(false);
  const [questionTarget, setQuestionTarget] = useState<Fact | null>(null);
  const [asking, setAsking] = useState(false);
  const [revealFlow, setRevealFlow] = useState<{ factId: string; stage: RevealStage } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [freeQuestionsRemaining, setFreeQuestionsRemaining] = useState(0);

  useEffect(() => {
    economyService.freeQuestionsRemaining(CURRENT_USER_ID).then(setFreeQuestionsRemaining);
  }, []);

  useEffect(() => {
    exploreProfile(userId);
  }, [userId]);

  const sortedFacts = useMemo(
    () =>
      allFacts
        .filter((f) => f.authorId === userId)
        .sort((a, b) => (a.price === 0 ? -1 : b.price === 0 ? 1 : a.price - b.price)),
    [allFacts, userId],
  );

  const photos = useMemo(() => allPhotos.filter((p) => p.ownerId === userId), [allPhotos, userId]);
  const shared = currentUser && user ? compatibilityScore(currentUser, user) : 0;

  if (!user) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.body}>Профиль не найден.</Text>
      </View>
    );
  }

  const handleConfirmPurchase = async () => {
    if (!purchaseTarget) return;
    setPurchasing(true);
    try {
      const outcome = await purchaseFact(purchaseTarget);
      setPurchaseTarget(null);
      showToast(`Факт открыт · −${outcome.pricePaid}`, 'success');
      setRevealFlow({ factId: outcome.fact.id, stage: 'revealed' });
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось открыть факт', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const handleConfirmPhotoPurchase = async () => {
    if (!photoTarget) return;
    setPurchasingPhoto(true);
    try {
      const outcome = await purchasePhoto(photoTarget);
      setPhotoTarget(null);
      showToast(`Фото открыто · −${outcome.pricePaid}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось открыть фото', 'error');
    } finally {
      setPurchasingPhoto(false);
    }
  };

  const handleReact = () => {
    if (!revealFlow) return;
    setRevealFlow({ ...revealFlow, stage: 'reacted' });
  };

  const handleSendQuestion = async (text: string) => {
    if (!questionTarget) return;
    setAsking(true);
    try {
      const outcome = await askQuestion(questionTarget, text);
      setQuestionTarget(null);
      setRevealFlow(null);
      setFreeQuestionsRemaining(outcome.freeQuestionsRemaining);
      const message = outcome.wasFree
        ? `Вопрос отправлен бесплатно · осталось ${outcome.freeQuestionsRemaining} сегодня`
        : `Вопрос отправлен · −${outcome.pricePaid} (дневной лимит бесплатных исчерпан)`;
      showToast(message, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось отправить вопрос', 'error');
    } finally {
      setAsking(false);
    }
  };

  const handleWrite = async () => {
    const conversationId = await openConversationWith(userId);
    navigation.navigate('Chat', { conversationId });
  };

  const handleReportFact = async (reason: string) => {
    const target = sortedFacts[0];
    if (!target) return;
    await reportFact(target.id, reason);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PhotoCarousel
          name={user.name}
          photos={photos}
          unlockedIds={unlockedPhotoIds}
          height={380}
          onUnlock={(photo) => setPhotoTarget(photo)}
          unlockingId={purchasingPhoto ? photoTarget?.id : null}
          headerOverlay={
            <View style={styles.heroButtons}>
              <Pressable onPress={navigation.goBack} style={[styles.iconButton, styles.backButton, { top: insets.top + 12 }]} accessibilityRole="button" accessibilityLabel="Назад" hitSlop={10}>
                <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(true)}
                style={[styles.iconButton, styles.menuButton, { top: insets.top + 12 }]}
                accessibilityRole="button"
                accessibilityLabel="Ещё"
                hitSlop={10}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
          }
        />

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={typography.title1}>{user.name}</Text>
            {user.verified ? <VerifiedBadge /> : null}
          </View>
          <Text style={styles.meta}>
            {user.age} · {user.city}
          </Text>
          {shared > 0 ? <CompatibilityTag sharedCount={shared} /> : null}
          <View style={styles.interestsRow}>
            {user.interests.map((i) => (
              <Badge key={i} label={interestLabel(i)} tone="neutral" />
            ))}
          </View>
          <Text style={[typography.body, styles.bio]}>{user.bio}</Text>

          <Button label="Написать" onPress={handleWrite} variant="secondary" size="md" style={styles.writeButton} />

          <Text style={[typography.eyebrow, styles.sectionTitle]}>Факты</Text>
          <View style={styles.factsList}>
            {sortedFacts.map((fact) => {
              const locked = !unlockedIds.has(fact.id);
              const isFlow = revealFlow?.factId === fact.id;
              return (
                <View key={fact.id}>
                  <FactCard
                    fact={fact}
                    locked={locked}
                    unlocking={purchasing && purchaseTarget?.id === fact.id}
                    onUnlock={() => setPurchaseTarget(fact)}
                  />
                  {isFlow ? (
                    <View style={styles.reactionRow}>
                      {revealFlow?.stage === 'revealed' ? (
                        <>
                          <Text style={styles.reactionPrompt}>Ну и как?</Text>
                          <View style={styles.reactionButtons}>
                            <Pressable onPress={handleReact} style={styles.reactionButton} accessibilityRole="button" accessibilityLabel="Стоило того">
                              <Ionicons name="thumbs-up-outline" size={14} color={colors.textPrimary} />
                              <Text style={styles.reactionText}>Стоило того</Text>
                            </Pressable>
                            <Pressable onPress={handleReact} style={styles.reactionButton} accessibilityRole="button" accessibilityLabel="Не очень">
                              <Ionicons name="thumbs-down-outline" size={14} color={colors.textPrimary} />
                              <Text style={styles.reactionText}>Не очень</Text>
                            </Pressable>
                          </View>
                        </>
                      ) : (
                        <Pressable onPress={() => setQuestionTarget(fact)} accessibilityRole="button">
                          <Text style={styles.askLink}>Спросить об этом →</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <PurchaseFactSheet
        visible={!!purchaseTarget}
        fact={purchaseTarget}
        onClose={() => setPurchaseTarget(null)}
        onConfirm={handleConfirmPurchase}
        loading={purchasing}
      />

      <PurchasePhotoSheet
        visible={!!photoTarget}
        photo={photoTarget}
        onClose={() => setPhotoTarget(null)}
        onConfirm={handleConfirmPhotoPurchase}
        loading={purchasingPhoto}
      />

      <AskQuestionSheet
        visible={!!questionTarget}
        onClose={() => setQuestionTarget(null)}
        onSend={handleSendQuestion}
        loading={asking}
        freeRemaining={freeQuestionsRemaining}
      />

      <ReportBlockSheet
        visible={menuOpen}
        userName={user.name}
        onClose={() => setMenuOpen(false)}
        onReportFact={handleReportFact}
        onReportUser={(reason) => reportUser(user.id, reason)}
        onBlock={async () => {
          await blockUser(user.id);
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  heroButtons: {
    ...StyleSheet.absoluteFill,
  },
  iconButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayScrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    left: spacing.lg,
  },
  menuButton: {
    right: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: 2,
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
    marginBottom: spacing.xs,
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
  writeButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  factsList: {
    gap: spacing.sm,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  reactionRow: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  reactionPrompt: {
    ...typography.subhead,
    marginBottom: spacing.xs,
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reactionText: {
    ...typography.subhead,
    color: colors.textPrimary,
  },
  askLink: {
    ...typography.bodyMedium,
    color: colors.accentText,
  },
});
