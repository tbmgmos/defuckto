import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { PhotoHero } from '../components/PhotoHero';
import { FactCard } from '../components/FactCard';
import { PurchaseFactSheet } from '../components/PurchaseFactSheet';
import { AskQuestionSheet } from '../components/AskQuestionSheet';
import { Badge } from '../components/Badge';
import { getUserById } from '../data/users';
import { useFactsStore } from '../stores/useFactsStore';
import { useToastStore } from '../stores/useToastStore';
import { askQuestion, exploreProfile, purchaseFact } from '../stores/actions';
import { interestLabel } from '../data/interests';
import { Fact } from '../models';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

type RevealStage = 'reacted' | 'revealed';

export function UserProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const user = getUserById(userId);
  const allFacts = useFactsStore((s) => s.facts);
  const unlockedIds = useFactsStore((s) => s.unlockedIds);
  const showToast = useToastStore((s) => s.show);

  const [purchaseTarget, setPurchaseTarget] = useState<Fact | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [questionTarget, setQuestionTarget] = useState<Fact | null>(null);
  const [asking, setAsking] = useState(false);
  const [revealFlow, setRevealFlow] = useState<{ factId: string; stage: RevealStage } | null>(null);

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
      showToast(`Факт открыт · −${outcome.fact.price} 🪙`, 'success');
      setRevealFlow({ factId: outcome.fact.id, stage: 'revealed' });
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось открыть факт', 'error');
    } finally {
      setPurchasing(false);
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
      await askQuestion(questionTarget, text);
      setQuestionTarget(null);
      setRevealFlow(null);
      showToast('Вопрос отправлен · −15 🪙', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось отправить вопрос', 'error');
    } finally {
      setAsking(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PhotoHero seed={user.photoSeed} name={user.name} height={380} borderRadius={0} style={styles.hero}>
          <Pressable onPress={navigation.goBack} style={[styles.backButton, { top: insets.top + 12 }]} accessibilityRole="button" accessibilityLabel="Назад" hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
        </PhotoHero>

        <View style={styles.body}>
          <Text style={typography.title1}>{user.name}</Text>
          <Text style={styles.meta}>
            {user.age} · {user.city}
          </Text>
          <View style={styles.interestsRow}>
            {user.interests.map((i) => (
              <Badge key={i} label={interestLabel(i)} tone="neutral" />
            ))}
          </View>
          <Text style={[typography.body, styles.bio]}>{user.bio}</Text>

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
                              <Text style={styles.reactionText}>👍 Стоило того</Text>
                            </Pressable>
                            <Pressable onPress={handleReact} style={styles.reactionButton} accessibilityRole="button" accessibilityLabel="Не очень">
                              <Text style={styles.reactionText}>👎 Не очень</Text>
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

      <AskQuestionSheet
        visible={!!questionTarget}
        onClose={() => setQuestionTarget(null)}
        onSend={handleSendQuestion}
        loading={asking}
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
  hero: {
    justifyContent: 'flex-start',
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
