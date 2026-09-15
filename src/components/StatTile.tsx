import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface StatTileProps {
  value: string;
  label: string;
}

export function StatTile({ value, label }: StatTileProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    ...typography.title1,
    fontSize: 22,
  },
  label: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
