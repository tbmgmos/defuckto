import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { FactCard } from '../components/FactCard';
import { FactActionButton } from '../components/FactActionButton';
import { PurchaseFactSheet } from '../components/PurchaseFactSheet';
import { PurchasePhotoSheet } from '../components/PurchasePhotoSheet';
import { AskQuestionSheet } from '../components/AskQuestionSheet';
import { ReportBlockSheet } from '../components/ReportBlockSheet';
import { Badge } from '../components/Badge';
import { UserBadges } from '../components/UserBadges';
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
import { economyService, planFactActions } from '../services';
import { computeCurrentPrice } from '../services/economyService';
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
  // Facts revealed on this visit, in the order the viewer asked for them.
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [revealFlow, setRevealFlow] = useState<{ factId: string; stage: RevealStage } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [freeQuestionsRemaining, setFreeQuestionsRemaining] = useState(0);

  useEffect(() => {
    economyService.freeQuestionsRemaining(CURRENT_USER_ID).then(setFreeQuestionsRemaining);
  }, []);

  useEffect(() => {
    exploreProfile(userId);
  }, [userId]);

  const userFacts = useMemo(() => allFacts.filter((f) => f.authorId === userId), [allFacts, userId]);
  const shownFacts = useMemo(
    () => shownIds.map((id) => userFacts.find((f) => f.id === id)).filter((f): f is Fact => !!f),
    [shownIds, userFacts],
  );
  const actions = useMemo(() => planFactActions(userFacts, unlockedIds, shownIds), [userFacts, unlockedIds, shownIds]);

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
      setShownIds((ids) => [...ids, outcome.fact.id]);
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

  // A fact that is already free or already bought is just shown; a locked one asks first.
  const openFact = (fact: Fact) => {
    if (fact.price === 0 || unlockedIds.has(fact.id)) {
      setShownIds((ids) => (ids.includes(fact.id) ? ids : [...ids, fact.id]));
    } else {
      setPurchaseTarget(fact);
    }
  };

  const showOpenedFacts = () => {
    setShownIds((ids) => [...ids, ...actions.opened.map((f) => f.id)]);
  };

  const handleReportFact = async (reason: string) => {
    const target = shownFacts[shownFacts.length - 1] ?? userFacts[0];
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
            <UserBadges user={user} size={18} />
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

          <Text style={[typography.eyebrow, styles.sectionTitle]}>Факты</Text>
          <View style={styles.factsList}>
            {shownFacts.map((fact) => {
              const isFlow = revealFlow?.factId === fact.id;
              return (
                <View key={fact.id}>
                  <FactCard fact={fact} locked={false} onUnlock={() => undefined} />
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

            {shownFacts.length === 0 ? (
              actions.free || actions.paid ? (
                <FactActionButton label="открыть факт" tone="go" onPress={() => openFact((actions.free ?? actions.paid) as Fact)} />
              ) : actions.hot ? null : (
                <Text style={styles.noFacts}>У {user.name} пока нет фактов.</Text>
              )
            ) : (
              <>
                {actions.free ? <FactActionButton label="еще факт" tone="go" onPress={() => openFact(actions.free as Fact)} /> : null}
                {actions.paid ? (
                  <FactActionButton
                    label="еще факт"
                    tone="go"
                    price={computeCurrentPrice(actions.paid.price, actions.paid.unlockCount)}
                    onPress={() => openFact(actions.paid as Fact)}
                  />
                ) : null}
              </>
            )}
            {actions.hot ? (
              <FactActionButton
                label="горячий факт"
                tone="hot"
                price={unlockedIds.has(actions.hot.id) ? undefined : computeCurrentPrice(actions.hot.price, actions.hot.unlockCount)}
                icon="flame"
                onPress={() => openFact(actions.hot as Fact)}
              />
            ) : null}
            {actions.opened.length > 0 ? (
              <FactActionButton label="открытый факт" tone="muted" onPress={showOpenedFacts} />
            ) : null}
            {/* Never gated: writing to someone is free whatever has or hasn't been opened. */}
            <FactActionButton label="НАПИСАТЬ" tone="go" icon="chatbubble-ellipses" onPress={handleWrite} />
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
  noFacts: {
    ...typography.subhead,
    color: colors.textTertiary,
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
