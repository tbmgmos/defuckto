import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { Fact, User } from '../models';
import { FACT_CATEGORIES } from '../data/factCategories';

interface DailyFactBannerProps {
  fact: Fact | null;
  author: User | null;
}

export function DailyFactBanner({ fact, author }: DailyFactBannerProps) {
  const [open, setOpen] = useState(false);
  if (!fact || !author) return null;
  const category = FACT_CATEGORIES[fact.category];

  const share = () => {
    Share.share({
      message: `Факт дня в DEFUCKTO от ${author.name}: «${fact.text}»\n\nЗнакомства без хуйни: https://tbmgmos.github.io/defuckto/`,
    }).catch(() => {});
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.container} accessibilityRole="button">
        <Ionicons name="sunny-outline" size={20} color={colors.textSecondary} />
        <View style={styles.textCol}>
          <Text style={styles.eyebrow}>Факт дня · бесплатно</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {author.name}: {fact.text}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} accessibilityLabel="Факт дня">
        <Text style={[typography.eyebrow]}>Факт дня</Text>
        <View style={styles.sheetAuthorRow}>
          <Ionicons name={category.icon as React.ComponentProps<typeof Ionicons>['name']} size={16} color={colors.textSecondary} />
          <Text style={[typography.title2, styles.sheetAuthor]}>{author.name}</Text>
        </View>
        <Text style={[typography.body, styles.sheetText]}>{fact.text}</Text>
        <Button label="Поделиться" onPress={share} size="lg" fullWidth style={styles.shareButton} />
        <Button label="Закрыть" onPress={() => setOpen(false)} variant="ghost" size="lg" fullWidth />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.accentText,
  },
  preview: {
    ...typography.subhead,
    color: colors.textPrimary,
  },
  sheetAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  sheetAuthor: {},
  sheetText: {
    marginBottom: spacing.lg,
  },
  shareButton: {
    marginBottom: spacing.xs,
  },
});
