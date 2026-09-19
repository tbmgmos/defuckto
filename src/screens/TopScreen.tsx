import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { Chip } from '../components/Chip';
import { PhotoHero } from '../components/PhotoHero';
import { UserBadges } from '../components/UserBadges';
import { EarnCoinsPanel } from '../components/EarnCoinsPanel';
import { TopPlacementSheet } from '../components/TopPlacementSheet';
import { CoinGlyph } from '../components/CoinGlyph';
import { useTopStore } from '../stores/useTopStore';
import { useQuestsStore } from '../stores/useQuestsStore';
import { useStreakStore } from '../stores/useStreakStore';
import { useModerationStore } from '../stores/useModerationStore';
import { useToastStore } from '../stores/useToastStore';
import { buyTopPlacement } from '../stores/actions';
import { TOP_PLACEMENT_PRICE, orderUsers, DiscoveryTab } from '../services';
import { TOP_PLACEMENT_HOURS } from '../services/localDatabase';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { colors, radius, spacing, typography } from '../theme';
import { User } from '../models';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Top'>,
  NativeStackScreenProps<RootStackParamList>
>;

type TopTab = 'top' | DiscoveryTab;

const TABS: { key: TopTab; label: string }[] = [
  { key: 'top', label: 'ТОП 100' },
  { key: 'new', label: 'Новые' },
  { key: 'near', label: 'Рядом' },
];

const COLUMNS = 3;
const GAP = spacing.xs;
const BIG_ASPECT = 1.35;
const SMALL_ASPECT = 1.05;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

export function TopScreen({ navigation }: Props) {
  const placements = useTopStore((s) => s.placements);
  const quests = useQuestsStore((s) => s.quests);
  const streak = useStreakStore((s) => s.streak);
  const blockedIds = useModerationStore((s) => s.blockedIds);
  const showToast = useToastStore((s) => s.show);

  const [tab, setTab] = useState<TopTab>('top');
  const [gridWidth, setGridWidth] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [buying, setBuying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      useTopStore.getState().load();
      useStreakStore.getState().load();
    }, []),
  );

  const myPlacement = placements.find((p) => p.userId === CURRENT_USER_ID);
  const hoursLeft = myPlacement
    ? Math.max(1, Math.ceil((new Date(myPlacement.expiresAt).getTime() - Date.now()) / 3_600_000))
    : 0;

  // Rank order is placement order; the other tabs just re-sort the same people.
  const ranked = useMemo(
    () =>
      placements
        .map((p) => getUserById(p.userId))
        .filter((u): u is User => !!u && !blockedIds.has(u.id)),
    [placements, blockedIds],
  );
  const shown = useMemo(
    () => (tab === 'top' ? ranked : orderUsers(ranked, tab, null)),
    [ranked, tab],
  );
  const rows = useMemo(() => chunk(shown, COLUMNS), [shown]);

  const cellWidth = gridWidth > 0 ? (gridWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const handleBuy = async () => {
    setBuying(true);
    try {
      await buyTopPlacement();
      setSheetOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось попасть в ТОП', 'error');
    } finally {
      setBuying(false);
    }
  };

  const onGridLayout = (e: LayoutChangeEvent) => setGridWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.root}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row[0].id}
        ListHeaderComponent={
          <>
            <EarnCoinsPanel quests={quests} streak={streak} onBuyCoins={() => showToast('Покупка монет скоро.')} />
            <View style={styles.tabsRow}>
              {TABS.map((t) => (
                <Chip key={t.key} label={t.label} selected={tab === t.key} onPress={() => setTab(t.key)} />
              ))}
            </View>
            <Pressable
              onPress={() => setSheetOpen(true)}
              style={styles.placement}
              accessibilityRole="button"
              accessibilityLabel={myPlacement ? 'Подняться в ТОП' : 'Попасть в ТОП'}
            >
              <View style={styles.placementText}>
                <Text style={typography.bodyMedium}>{myPlacement ? 'Ты в ТОП 100' : 'Попасть в ТОП 100'}</Text>
                <Text style={styles.placementSub}>
                  {myPlacement ? `Ещё ${hoursLeft} ч · можно подняться выше` : `${TOP_PLACEMENT_HOURS} ч на виду у всех`}
                </Text>
              </View>
              <Text style={styles.placementPrice}>
                {myPlacement ? 'Поднять' : ''} {TOP_PLACEMENT_PRICE} <CoinGlyph size={12} color={colors.accentText} />
              </Text>
            </Pressable>
            <View onLayout={onGridLayout} style={styles.gridProbe} />
          </>
        }
        renderItem={({ item: row, index }) => {
          const big = tab === 'top' && index === 0;
          return (
            <View style={[styles.row, { gap: GAP }]}>
              {row.map((user, i) => (
                <TopCell
                  key={user.id}
                  user={user}
                  rank={index * COLUMNS + i + 1}
                  showRank={tab === 'top'}
                  width={cellWidth}
                  height={cellWidth * (big ? BIG_ASPECT : SMALL_ASPECT)}
                  onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
                />
              ))}
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>В ТОПе пока никого. Стань первым.</Text>}
      />

      <TopPlacementSheet
        visible={sheetOpen}
        alreadyInTop={!!myPlacement}
        price={TOP_PLACEMENT_PRICE}
        hours={TOP_PLACEMENT_HOURS}
        onClose={() => setSheetOpen(false)}
        onConfirm={handleBuy}
        loading={buying}
      />
    </View>
  );
}

interface TopCellProps {
  user: User;
  rank: number;
  showRank: boolean;
  width: number;
  height: number;
  onPress: () => void;
}

function TopCell({ user, rank, showRank, width, height, onPress }: TopCellProps) {
  if (width <= 0) return null;
  return (
    <Pressable
      onPress={onPress}
      style={{ width }}
      accessibilityRole="button"
      accessibilityLabel={`${user.name}, ${user.age}${showRank ? `, место ${rank}` : ''}`}
    >
      <PhotoHero
        seed={user.photoSeed}
        name={user.name}
        photoUri={user.photoUri}
        height={height}
        borderRadius={radius.md}
        fillOverlay={
          <View style={styles.cellOverlay} pointerEvents="none">
            {showRank ? (
              <View style={styles.rank}>
                <Text style={styles.rankText}>{rank}</Text>
              </View>
            ) : null}
            <View style={styles.cellFooter}>
              <Text style={styles.cellName} numberOfLines={1}>
                {user.name}, {user.age}
              </Text>
              <UserBadges user={user} size={13} />
            </View>
          </View>
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  placement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placementText: {
    flex: 1,
  },
  placementSub: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 2,
  },
  placementPrice: {
    ...typography.subhead,
    color: colors.accentText,
    fontWeight: '700',
  },
  // Zero-height row inside the list's padded column: its measured width is the grid's usable width.
  gridProbe: {
    height: 0,
    marginHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: GAP,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  cellOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xs,
  },
  rank: {
    alignSelf: 'flex-start',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.overlayScrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cellFooter: {
    gap: 3,
  },
  cellName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  empty: {
    ...typography.subhead,
    textAlign: 'center',
    color: colors.textTertiary,
    marginTop: spacing.xxl,
  },
});
