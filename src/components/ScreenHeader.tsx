import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { CoinBalance } from './CoinBalance';
import { NotificationsBell } from './NotificationsBell';
import { useWalletStore } from '../stores/useWalletStore';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBalancePress?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBalancePress, right }: ScreenHeaderProps) {
  const balance = useWalletStore((s) => s.wallet?.balance ?? 0);

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={typography.title1}>{title}</Text>
        {subtitle ? <Text style={[typography.subhead, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>
        {right}
        <NotificationsBell />
        <CoinBalance balance={balance} onPress={onBalancePress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
