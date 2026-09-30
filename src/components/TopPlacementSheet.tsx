import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { CoinGlyph } from './CoinGlyph';
import { colors, spacing, typography } from '../theme';

interface TopPlacementSheetProps {
  visible: boolean;
  alreadyInTop: boolean;
  price: number;
  hours: number;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function TopPlacementSheet({ visible, alreadyInTop, price, hours, onClose, onConfirm, loading }: TopPlacementSheetProps) {
  const title = alreadyInTop ? 'Подняться в ТОП 100?' : 'Попасть в ТОП 100?';
  const cta = alreadyInTop ? 'Поднять' : 'В ТОП';

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel={title}>
      <Text style={typography.title2}>{title}</Text>
      <Text style={[typography.body, styles.body]}>
        {price} <CoinGlyph size={13} color={colors.textSecondary} /> за {hours} ч в ТОПе.{'\n'}
        Цена одна для всех: место в списке зависит от того, когда ты вошёл, а не от суммы.
        {alreadyInTop ? ' Если уже в ТОПе — поднимешься на первое место, а время начнётся заново.' : ''}
      </Text>
      <Button
        label={loading ? 'Оформляем…' : `${cta} за ${price}`}
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
