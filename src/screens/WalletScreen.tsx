import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { CoinBalance } from '../components/CoinBalance';
import { Button } from '../components/Button';
import { CoinGlyph } from '../components/CoinGlyph';
import { useWalletStore } from '../stores/useWalletStore';
import { useToastStore } from '../stores/useToastStore';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { formatRelativeTime } from '../utils/date';
import { Transaction } from '../models';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

const EARN_IDEAS: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; detail: string }[] = [
  { icon: 'create-outline', title: 'Добавить факт', detail: '+20' },
  { icon: 'lock-open-outline', title: 'Кто-то открыл твой факт', detail: '+70%' },
  { icon: 'calendar-outline', title: 'Ежедневная активность', detail: '+…' },
];

export function WalletScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const wallet = useWalletStore((s) => s.wallet);
  const transactions = useWalletStore((s) => s.transactions);
  const showToast = useToastStore((s) => s.show);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={navigation.goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Закрыть" style={styles.closeButton}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={typography.headline}>Кошелёк</Text>
        <View style={styles.closeButton} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.balanceBlock}>
            <CoinBalance balance={wallet?.balance ?? 0} />
            <Text style={[typography.eyebrow, styles.sectionTitle]}>Последние операции</Text>
          </View>
        }
        renderItem={({ item }) => <TransactionRow tx={item} />}
        ListFooterComponent={
          <View style={styles.earnSection}>
            <Text style={typography.eyebrow}>Как заработать</Text>
            {EARN_IDEAS.map((idea) => (
              <View key={idea.title} style={styles.earnRow}>
                <Ionicons name={idea.icon} size={18} color={colors.textSecondary} />
                <Text style={[typography.body, styles.earnTitle]}>{idea.title}</Text>
                <Text style={styles.earnDetail}>{idea.detail}</Text>
              </View>
            ))}
            <Button
              label="Получить больше монет"
              onPress={() => showToast('Скоро.')}
              variant="secondary"
              fullWidth
              style={styles.earnButton}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const positive = tx.amount >= 0;
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, positive ? styles.txIconPositive : styles.txIconNegative]}>
        <Text style={styles.txIconText}>{positive ? '+' : '−'}</Text>
      </View>
      <View style={styles.txTextCol}>
        <Text style={typography.body} numberOfLines={1}>
          {tx.description}
        </Text>
        <Text style={styles.txTime}>{formatRelativeTime(tx.createdAt)}</Text>
      </View>
      <Text style={[styles.txAmount, positive ? styles.txAmountPositive : styles.txAmountNegative]}>
        {positive ? '+' : ''}
        {tx.amount} <CoinGlyph size={12} color={positive ? colors.success : colors.textSecondary} />
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  balanceBlock: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconPositive: {
    backgroundColor: colors.successMuted,
  },
  txIconNegative: {
    backgroundColor: colors.surfaceAlt,
  },
  txIconText: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  txTextCol: {
    flex: 1,
    gap: 2,
  },
  txTime: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
  txAmount: {
    ...typography.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
  txAmountPositive: {
    color: colors.success,
  },
  txAmountNegative: {
    color: colors.textSecondary,
  },
  earnSection: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  earnTitle: {
    flex: 1,
  },
  earnDetail: {
    ...typography.subhead,
    color: colors.accentText,
    fontWeight: '700',
  },
  earnButton: {
    marginTop: spacing.sm,
  },
});
