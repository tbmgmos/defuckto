import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { Chip } from '../components/Chip';
import { FactFeedCard } from '../components/FactFeedCard';
import { PurchaseFactSheet } from '../components/PurchaseFactSheet';
import { WeeklyStars } from '../components/WeeklyStars';
import { useFactsStore } from '../stores/useFactsStore';
import { useToastStore } from '../stores/useToastStore';
import { purchaseFact } from '../stores/actions';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { FACT_CATEGORY_LIST } from '../data/factCategories';
import { leaderboardService, CategoryStar } from '../services/leaderboardService';
import { colors, spacing, touchTarget, typography } from '../theme';
import { Fact, FactCategory } from '../models';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'FactsFeed'>,
  NativeStackScreenProps<RootStackParamList>
>;

type CategoryFilter = 'all' | FactCategory;

export function FactsFeedScreen({ navigation }: Props) {
  const allFacts = useFactsStore((s) => s.facts);
  const unlockedIds = useFactsStore((s) => s.unlockedIds);
  const showToast = useToastStore((s) => s.show);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [purchaseTarget, setPurchaseTarget] = useState<Fact | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [stars, setStars] = useState<CategoryStar[]>([]);

  useEffect(() => {
    leaderboardService.getWeeklyStars().then(setStars);
  }, [allFacts]);

  const filtered = useMemo(() => {
    const eligible = allFacts.filter((f) => f.authorId !== CURRENT_USER_ID && f.price > 0);
    return category === 'all' ? eligible : eligible.filter((f) => f.category === category);
  }, [allFacts, category]);

  const handleConfirmPurchase = async () => {
    if (!purchaseTarget) return;
    setPurchasing(true);
    try {
      const outcome = await purchaseFact(purchaseTarget);
      setPurchaseTarget(null);
      showToast(`Факт открыт · −${outcome.pricePaid} 🪙`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось открыть факт', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title="Интересное"
              subtitle="Люди рассказали о себе то, чего не увидишь в профиле."
              onBalancePress={() => navigation.navigate('Wallet')}
              right={
                <Pressable
                  onPress={() => navigation.navigate('GuessGame')}
                  style={styles.gameButton}
                  accessibilityRole="button"
                  accessibilityLabel="Угадай, чей факт"
                >
                  <Ionicons name="game-controller-outline" size={20} color={colors.textPrimary} />
                </Pressable>
              }
            />
            <WeeklyStars stars={stars} onPressAuthor={(userId) => navigation.navigate('UserProfile', { userId })} />
            <FlatList
              horizontal
              data={[{ key: 'all', label: 'Все' }, ...FACT_CATEGORY_LIST.map((c) => ({ key: c.key, label: c.label }))]}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              renderItem={({ item }) => (
                <Chip
                  label={item.label}
                  selected={category === item.key}
                  onPress={() => setCategory(item.key as CategoryFilter)}
                />
              )}
            />
          </>
        }
        renderItem={({ item }) => {
          const author = getUserById(item.authorId);
          if (!author) return null;
          const locked = !unlockedIds.has(item.id);
          return (
            <View style={styles.cardWrap}>
              <FactFeedCard
                fact={item}
                author={author}
                locked={locked}
                unlocking={purchasing && purchaseTarget?.id === item.id}
                onOpenProfile={() => navigation.navigate('UserProfile', { userId: author.id })}
                onUnlock={() => setPurchaseTarget(item)}
              />
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[typography.subhead, styles.empty]}>В этой категории пока пусто.</Text>
        }
      />

      <PurchaseFactSheet
        visible={!!purchaseTarget}
        fact={purchaseTarget}
        onClose={() => setPurchaseTarget(null)}
        onConfirm={handleConfirmPurchase}
        loading={purchasing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  cardWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.textTertiary,
  },
  gameButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: touchTarget.min / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
