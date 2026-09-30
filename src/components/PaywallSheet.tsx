import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
  onActivate: () => void;
  loading?: boolean;
  alreadyPremium?: boolean;
}

const PERKS = [
  'Видишь, кто заинтересовался тобой — без доплаты за каждое имя',
  'Скидка 20% на все покупки фактов и фото',
  '+1 ежедневное задание с наградой',
];

export function PaywallSheet({ visible, onClose, onActivate, loading, alreadyPremium }: PaywallSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="DEFUCKTO+">
      <Text style={[typography.eyebrow, { color: colors.accentText }]}>DEFUCKTO+</Text>
      <Text style={[typography.title2, styles.title]}>Люби любопытство без ограничений</Text>

      <View style={styles.perks}>
        {PERKS.map((perk) => (
          <View key={perk} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[typography.body, styles.perkText]}>{perk}</Text>
          </View>
        ))}
      </View>

      {alreadyPremium ? (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Уже активно</Text>
        </View>
      ) : (
        <Button
          label={loading ? 'Активируем…' : 'Оформить (демо-режим)'}
        variant="accent"
          onPress={onActivate}
          size="lg"
          fullWidth
          disabled={loading}
          style={styles.cta}
        />
      )}
      <Button label="Позже" onPress={onClose} variant="ghost" size="lg" fullWidth />
      <Text style={styles.disclaimer}>
        Реальные платежи в демо не подключены — активация ничего не списывает.
      </Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 4,
    marginBottom: spacing.md,
  },
  perks: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  perkText: {
    flex: 1,
  },
  cta: {
    marginBottom: spacing.xs,
  },
  activeBadge: {
    backgroundColor: colors.successMuted,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeBadgeText: {
    ...typography.bodyMedium,
    color: colors.success,
  },
  disclaimer: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
