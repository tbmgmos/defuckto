import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { CoinBalance } from './CoinBalance';
import { NotificationsBell } from './NotificationsBell';
import { useWalletStore } from '../stores/useWalletStore';
import { colors, spacing, touchTarget, typography } from '../theme';

/** Wordmark + notifications, profile and balance — shown above every tab. */
export function AppHeader() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const balance = useWalletStore((s) => s.wallet?.balance ?? 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <Text style={styles.logo} accessibilityRole="header">
        DE<Text style={styles.logoAccent}>FUCKTO</Text>
      </Text>
      <View style={styles.right}>
        <NotificationsBell />
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Мой профиль"
        >
          <Ionicons name="person-outline" size={20} color={colors.textPrimary} />
        </Pressable>
        <CoinBalance balance={balance} onPress={() => navigation.navigate('Wallet')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  logo: {
    ...typography.title2,
    letterSpacing: 0.5,
    fontWeight: '800',
  },
  logoAccent: {
    color: colors.accent,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
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
