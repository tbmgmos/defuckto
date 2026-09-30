import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { Chip } from '../components/Chip';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { DailyFactBanner } from '../components/DailyFactBanner';
import { FilterSheet } from '../components/FilterSheet';
import { useUsersStore } from '../stores/useUsersStore';
import { useFactsStore } from '../stores/useFactsStore';
import { useModerationStore } from '../stores/useModerationStore';
import { useTopStore } from '../stores/useTopStore';
import { useFiltersStore } from '../stores/useFiltersStore';
import { useSparkStore } from '../stores/useSparkStore';
import { useToastStore } from '../stores/useToastStore';
import { dailyFactService } from '../services/dailyFactService';
import { DiscoveryTab, activeFilterCount, applyFilters, orderUsers } from '../services/discoveryService';
import { compatibilityScore } from '../utils/compatibility';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { Fact, User } from '../models';
import { getUserById } from '../data/users';
import { sendSpark } from '../stores/actions';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Discovery'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TABS: { key: DiscoveryTab; label: string }[] = [
  { key: 'foryou', label: 'Для тебя' },
  { key: 'new', label: 'Новые' },
  { key: 'near', label: 'Рядом' },
];

export function DiscoveryScreen({ navigation }: Props) {
  const users = useUsersStore((s) => s.users);
  const currentUser = useUsersStore((s) => s.currentUser);
  const facts = useFactsStore((s) => s.facts);
  const unlockedIds = useFactsStore((s) => s.unlockedIds);
  const blockedIds = useModerationStore((s) => s.blockedIds);
  const topPlacements = useTopStore((s) => s.placements);
  const filters = useFiltersStore((s) => s.filters);
  const sparkedIds = useSparkStore((s) => s.sparkedIds);
  const setAgeRange = useFiltersStore((s) => s.setAgeRange);
  const setCity = useFiltersStore((s) => s.setCity);
  const toggleInterest = useFiltersStore((s) => s.toggleInterest);
  const setGender = useFiltersStore((s) => s.setGender);
  const toggleFlag = useFiltersStore((s) => s.toggleFlag);
  const resetFilters = useFiltersStore((s) => s.reset);
  const showToast = useToastStore((s) => s.show);

  const [tab, setTab] = useState<DiscoveryTab>('foryou');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [dailyFact, setDailyFact] = useState<Fact | null>(null);

  useEffect(() => {
    dailyFactService.getFactOfTheDay().then((f) => setDailyFact(f ?? null));
  }, []);

  const handleSpark = async (userId: string) => {
    try {
      await sendSpark(userId);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось отметить интерес', 'error');
    }
  };

  useFocusEffect(
    useCallback(() => {
      useTopStore.getState().load();
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

  const topIds = useMemo(() => new Set(topPlacements.map((p) => p.userId)), [topPlacements]);
  const hotAuthorIds = useMemo(
    () => new Set(facts.filter((f) => f.hot && f.moderationStatus === 'approved').map((f) => f.authorId)),
    [facts],
  );

  const orderedUsers = useMemo(() => {
    const visible = applyFilters(users, filters, { viewer: currentUser, blockedIds, topIds, hotAuthorIds });
    return orderUsers(visible, tab, currentUser);
  }, [users, filters, currentUser, blockedIds, topIds, hotAuthorIds, tab]);

  const dailyFactAuthor: User | null = dailyFact ? getUserById(dailyFact.authorId) ?? null : null;
  const filterCount = activeFilterCount(filters);

  return (
    <View style={styles.root}>
      <FlatList
        data={orderedUsers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Pressable
              onPress={() => setFilterSheetOpen(true)}
              style={styles.filterButton}
              accessibilityRole="button"
              accessibilityLabel={filterCount > 0 ? `Фильтр, включено: ${filterCount}` : 'Фильтр'}
            >
              <Text style={styles.filterLabel}>ФИЛЬТР</Text>
              <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
              {filterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filterCount}</Text>
                </View>
              ) : null}
            </Pressable>
            <DailyFactBanner fact={dailyFact} author={dailyFactAuthor} />
            <FlatList
              horizontal
              data={TABS}
              keyExtractor={(t) => t.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              renderItem={({ item }) => (
                <Chip label={item.label} selected={tab === item.key} onPress={() => setTab(item.key)} />
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
            onSpark={() => handleSpark(item.id)}
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
        onGenderChange={setGender}
        onCityChange={setCity}
        onToggleInterest={toggleInterest}
        onToggleFlag={toggleFlag}
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
    minHeight: touchTarget.min,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  filterLabel: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: spacing.sm,
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
    color: colors.onAccent,
  },
});
