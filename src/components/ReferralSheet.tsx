import React from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { ReferralInfo } from '../models';
import { REFERRAL_BONUS } from '../services/referralService';
import { useToastStore } from '../stores/useToastStore';

interface ReferralSheetProps {
  visible: boolean;
  referral: ReferralInfo | null;
  onClose: () => void;
  onSimulateRedeem: () => void;
}

// Honest limitation: this code isn't checked by any signup flow, since
// there's no backend to issue/validate it against (see referralService).
// Sharing works for real; "friend joined" is a demo-only simulate button.
export function ReferralSheet({ visible, referral, onClose, onSimulateRedeem }: ReferralSheetProps) {
  const showToast = useToastStore((s) => s.show);

  const copy = async () => {
    if (!referral) return;
    await Clipboard.setStringAsync(referral.code);
    showToast('Код скопирован', 'success');
  };

  const share = () => {
    if (!referral) return;
    Share.share({
      message: `Заходи в DEFUCKTO по моему коду ${referral.code} — оба получим монеты: https://tbmgmos.github.io/defuckto/`,
    }).catch(() => {});
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Пригласить друга">
      <Text style={typography.title2}>Пригласи друга</Text>
      <Text style={[typography.body, styles.body]}>
        Когда друг присоединится по твоему коду, вы оба получите по {REFERRAL_BONUS} 🪙.
      </Text>

      {referral ? (
        <View style={styles.codeBox}>
          <Text style={styles.code}>{referral.code}</Text>
        </View>
      ) : null}

      <View style={styles.buttonsRow}>
        <Button label="Скопировать" onPress={copy} variant="secondary" style={styles.buttonHalf} />
        <Button label="Поделиться" onPress={share} variant="primary" style={styles.buttonHalf} />
      </View>

      <Button
        label={`Демо: друг присоединился (+${REFERRAL_BONUS} 🪙)`}
        onPress={onSimulateRedeem}
        variant="ghost"
        size="lg"
        fullWidth
        style={styles.simulate}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  codeBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  code: {
    ...typography.title2,
    letterSpacing: 2,
    color: colors.accentText,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
  simulate: {
    marginTop: spacing.xs,
  },
});
