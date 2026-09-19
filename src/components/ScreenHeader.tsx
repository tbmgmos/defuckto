import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

// The in-screen title row. Balance, notifications and profile live in the
// app-wide AppHeader above the tabs, so this only carries the screen's own
// title and optional trailing action.
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={typography.title1}>{title}</Text>
        {subtitle ? <Text style={[typography.subhead, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
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
