import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme';
import { Fact } from '../models';

interface PurchaseFactSheetProps {
  visible: boolean;
  fact: Fact | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function PurchaseFactSheet({ visible, fact, onClose, onConfirm, loading }: PurchaseFactSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Открыть факт">
      <Text style={typography.title2}>Открыть факт?</Text>
      <Text style={[typography.body, styles.body]}>
        С тебя {fact?.price ?? 0} 🪙.{'\n'}Автор факта получит часть этой суммы.
      </Text>
      <Button
        label={loading ? 'Открываем…' : `Открыть за ${fact?.price ?? 0} 🪙`}
        onPress={onConfirm}
        size="lg"
        fullWidth
        disabled={loading}
        style={styles.confirm}
      />
      <Button label="Не сейчас" onPress={onClose} variant="ghost" size="lg" fullWidth />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  confirm: {
    marginBottom: spacing.xs,
  },
});
