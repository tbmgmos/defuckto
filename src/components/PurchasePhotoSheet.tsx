import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme';
import { ProfilePhoto } from '../models';
import { computeCurrentPrice } from '../services/economyService';
import { CoinGlyph } from './CoinGlyph';

interface PurchasePhotoSheetProps {
  visible: boolean;
  photo: ProfilePhoto | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function PurchasePhotoSheet({ visible, photo, onClose, onConfirm, loading }: PurchasePhotoSheetProps) {
  const price = photo ? computeCurrentPrice(photo.price, photo.unlockCount) : 0;
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Открыть фото">
      <Text style={typography.title2}>Открыть фото?</Text>
      <Text style={[typography.body, styles.body]}>
        С тебя {price} <CoinGlyph size={13} color={colors.textSecondary} />.{'\n'}Не всё видно на фото — иногда буквально.
      </Text>
      <Button
        label={loading ? 'Открываем…' : `Открыть за ${price}`}
        variant="accent"
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
