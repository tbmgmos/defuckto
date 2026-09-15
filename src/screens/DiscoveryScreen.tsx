import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { Chip } from '../components/Chip';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { DailyQuests } from '../components/DailyQuests';
import { StreakBanner } from '../components/StreakBanner';
import { DailyFactBanner } from '../components/DailyFactBanner';
import { FilterSheet } from '../components/FilterSheet';
import { useUsersStore } from '../stores/useUsersStore';
import { useFactsStore } from '../stores/useFactsStore';
import { useQuestsStore } from '../stores/useQuestsStore';
import { useModerationStore } from '../stores/useModerationStore';
import { useStreakStore } from '../stores/useStreakStore';
import { useFiltersStore } from '../stores/useFiltersStore';
import { useSparkStore } from '../stores/useSparkStore';
import { DISCOVERY_META } from '../data/discoveryMeta';
import { dailyFactService } from '../services/dailyFactService';
import { compatibilityScore } from '../utils/compatibility';
import { colors, spacing, touchTarget } from '../theme';
import { Fact, User } from '../models';
import { getUserById } from '../data/users';
import { sendSpark } from '../stores/actions';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Discovery'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FILTERS = ['Для тебя', 'Новые', 'Рядом', 'Популярные'] as const;
type Filter = (typeof FILTERS)[number];

export function DiscoveryScreen({ navigation }: Props) {
  const users = useUsersStore((s) => s.users);
  const currentUser = useUsersStore((s) => s.currentUser);
  const facts = useFactsStore((s) => s.facts);
  const unlockedIds = useFactsStore((s) => s.unlockedIds);
  const quests = useQuestsStore((s) => s.quests);
  const blockedIds = useModerationStore((s) => s.blockedIds);
  const streak = useStreakStore((s) => s.streak);
  const filters = useFiltersStore((s) => s.filters);
  const sparkedIds = useSparkStore((s) => s.sparkedIds);
  const setAgeRange = useFiltersStore((s) => s.setAgeRange);
  const setCity = useFiltersStore((s) => s.setCity);
  const toggleInterest = useFiltersStore((s) => s.toggleInterest);
  const resetFilters = useFiltersStore((s) => s.reset);

  const [filter, setFilter] = useState<Filter>('Для тебя');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [dailyFact, setDailyFact] = useState<Fact | null>(null);

  useEffect(() => {
    dailyFactService.getFactOfTheDay().then((f) => setDailyFact(f ?? null));
  }, []);

  useFocusEffect(
    useCallback(() => {
      useStreakStore.getState().load();
    }, []),
  );

  const unlockedCountByAuthor = useMemo(() => {
    const map = new Map<string, number>();
    facts.forEach((f) => {
      if (unlockedIds.has(f.id)) map.set(f.authorId, (map.get(f.authorId) ?? 0) + 1);
    });
    return map;
  }, [facts, unlockedIds]);

  const cities = useMemo(() => Array.from(new Set(users.map((u) => u.city))).sort(), [users]);

  const visibleUsers = useMemo(() => {
    return users.filter((u) => {
      if (blockedIds.has(u.id)) return false;
      if (u.age < filters.minAge || u.age > filters.maxAge) return false;
      if (filters.city && u.city !== filters.city) return false;
      if (filters.interests.length > 0 && !filters.interests.some((i) => u.interests.includes(i))) return false;
      return true;
    });
  }, [users, blockedIds, filters]);

  const orderedUsers = useMemo(() => {
    const list = [...visibleUsers];
    if (filter === 'Новые') {
      list.sort((a, b) => (DISCOVERY_META[a.id]?.joinedDaysAgo ?? 99) - (DISCOVERY_META[b.id]?.joinedDaysAgo ?? 99));
    } else if (filter === 'Рядом') {
      list.sort((a, b) => (DISCOVERY_META[a.id]?.distanceKm ?? 9999) - (DISCOVERY_META[b.id]?.distanceKm ?? 9999));
    } else if (filter === 'Популярные') {
      list.sort((a, b) => (unlockedCountByAuthor.get(b.id) ?? 0) - (unlockedCountByAuthor.get(a.id) ?? 0));
    } else if (currentUser) {
      list.sort((a, b) => compatibilityScore(currentUser, b) - compatibilityScore(currentUser, a));
    }
    return list;
  }, [visibleUsers, filter, unlockedCountByAuthor, currentUser]);

  const dailyFactAuthor: User | null = dailyFact ? getUserById(dailyFact.authorId) ?? null : null;
  const activeFilterCount =
    (filters.city ? 1 : 0) + filters.interests.length + (filters.minAge !== 18 || filters.maxAge !== 45 ? 1 : 0);

  return (
    <View style={styles.root}>
      <FlatList
        data={orderedUsers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title="Знакомства"
              onBalancePress={() => navigation.navigate('Wallet')}
              right={
                <Pressable
                  onPress={() => setFilterSheetOpen(true)}
                  style={styles.filterButton}
                  accessibilityRole="button"
                  accessibilityLabel="Фильтры"
                >
                  <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
                  {activeFilterCount > 0 ? (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              }
            />
            <StreakBanner streak={streak} />
            <DailyFactBanner fact={dailyFact} author={dailyFactAuthor} />
            <DailyQuests quests={quests} />
            <FlatList
              horizontal
              data={FILTERS as unknown as Filter[]}
              keyExtractor={(f) => f}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              renderItem={({ item }) => (
                <Chip label={item} selected={filter === item} onPress={() => setFilter(item)} />
              )}
            />
          </>
        }
        renderItem={({ item }) => (
          <DiscoveryCard
            user={item}
            unlockedFactsCount={unlockedCountByAuthor.get(item.id) ?? 0}
            sharedInterests={currentUser ? compatibilityScore(currentUser, item) : 0}
            sparked={sparkedIds.has(item.id)}
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
            onSpark={() => sendSpark(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[{ textAlign: 'center', marginTop: spacing.xxl, color: colors.textTertiary }]}>
            Никого не нашлось под эти фильтры.
          </Text>
        }
      />

      <FilterSheet
        visible={filterSheetOpen}
        filters={filters}
        cities={cities}
        onClose={() => setFilterSheetOpen(false)}
        onAgeChange={setAgeRange}
        onCityChange={setCity}
        onToggleInterest={toggleInterest}
        onReset={resetFilters}
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
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  filterButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: touchTarget.min / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textInverse,
  },
});
