import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface CompatibilityTagProps {
  sharedCount: number;
}

export function CompatibilityTag({ sharedCount }: CompatibilityTagProps) {
  if (sharedCount <= 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {sharedCount} {pluralInterests(sharedCount)} совпадает
      </Text>
    </View>
  );
}

function pluralInterests(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'интерес';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'интереса';
  return 'интересов';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.successMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.success,
  },
});
