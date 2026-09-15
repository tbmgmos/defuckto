import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { Chip } from '../components/Chip';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { DailyQuests } from '../components/DailyQuests';
import { useUsersStore } from '../stores/useUsersStore';
import { useFactsStore } from '../stores/useFactsStore';
import { useQuestsStore } from '../stores/useQuestsStore';
import { DISCOVERY_META } from '../data/discoveryMeta';
import { spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Discovery'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FILTERS = ['Для тебя', 'Новые', 'Рядом', 'Популярные'] as const;
type Filter = (typeof FILTERS)[number];

export function DiscoveryScreen({ navigation }: Props) {
  const users = useUsersStore((s) => s.users);
  const facts = useFactsStore((s) => s.facts);
  const unlockedIds = useFactsStore((s) => s.unlockedIds);
  const quests = useQuestsStore((s) => s.quests);
  const [filter, setFilter] = useState<Filter>('Для тебя');

  const unlockedCountByAuthor = useMemo(() => {
    const map = new Map<string, number>();
    facts.forEach((f) => {
      if (unlockedIds.has(f.id)) map.set(f.authorId, (map.get(f.authorId) ?? 0) + 1);
    });
    return map;
  }, [facts, unlockedIds]);

  const orderedUsers = useMemo(() => {
    const list = [...users];
    if (filter === 'Новые') {
      list.sort((a, b) => (DISCOVERY_META[a.id]?.joinedDaysAgo ?? 99) - (DISCOVERY_META[b.id]?.joinedDaysAgo ?? 99));
    } else if (filter === 'Рядом') {
      list.sort((a, b) => (DISCOVERY_META[a.id]?.distanceKm ?? 9999) - (DISCOVERY_META[b.id]?.distanceKm ?? 9999));
    } else if (filter === 'Популярные') {
      list.sort((a, b) => (unlockedCountByAuthor.get(b.id) ?? 0) - (unlockedCountByAuthor.get(a.id) ?? 0));
    }
    return list;
  }, [users, filter, unlockedCountByAuthor]);

  return (
    <View style={styles.root}>
      <FlatList
        data={orderedUsers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <ScreenHeader title="Знакомства" onBalancePress={() => navigation.navigate('Wallet')} />
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
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
});
