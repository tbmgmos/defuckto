import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { useOnboardingStore } from '../stores/useOnboardingStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const HEADER_LEGEND: { icon: IconName; label: string }[] = [
  { icon: 'notifications-outline', label: 'Уведомления' },
  { icon: 'person-outline', label: 'Профиль' },
  { icon: 'ellipse', label: 'Баланс' },
];

const TAB_LEGEND: { icon: IconName; label: string }[] = [
  { icon: 'search-outline', label: 'Поиск' },
  { icon: 'bulb-outline', label: 'Факты' },
  { icon: 'trophy-outline', label: 'ТОП 100' },
  { icon: 'chatbubble-ellipses-outline', label: 'Сообщения' },
];

const PAGES = 3;

/** One-time walkthrough over the main screen, right after onboarding. */
export function WelcomeTour() {
  const tourSeen = useOnboardingStore((s) => s.tourSeen);
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);
  const markTourSeen = useOnboardingStore((s) => s.markTourSeen);
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);

  const visible = hasCompletedOnboarding === true && !tourSeen;
  const last = page === PAGES - 1;

  const next = () => {
    if (last) {
      markTourSeen();
    } else {
      setPage((p) => p + 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={markTourSeen}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dotsRow}>
          {Array.from({ length: PAGES }, (_, i) => (
            <View key={i} style={[styles.dot, i <= page && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.card}>
          {page === 0 ? (
            <>
              <Text style={typography.title1}>Здесь знакомятся через факты</Text>
              <Text style={[typography.body, styles.text]}>
                Фото не расскажет главного. Открывай факты о людях — и пиши тем, кто зацепил.
              </Text>
            </>
          ) : null}

          {page === 1 ? (
            <>
              <Text style={typography.title1}>Где что находится</Text>
              <Text style={[typography.eyebrow, styles.legendTitle]}>Сверху</Text>
              <View style={styles.legendRow}>
                {HEADER_LEGEND.map((item) => (
                  <LegendItem key={item.label} icon={item.icon} label={item.label} />
                ))}
              </View>
              <Text style={[typography.eyebrow, styles.legendTitle]}>Внизу</Text>
              <View style={styles.legendRow}>
                {TAB_LEGEND.map((item) => (
                  <LegendItem key={item.label} icon={item.icon} label={item.label} />
                ))}
              </View>
            </>
          ) : null}

          {page === 2 ? (
            <>
              <Text style={typography.title1}>Монеты — это внимание</Text>
              <Text style={[typography.body, styles.text]}>
                За задания и свои факты ты получаешь монеты, на них открываешь чужие. Писать людям можно всегда, бесплатно.
              </Text>
            </>
          ) : null}
        </View>

        <Button label={last ? 'Понятно' : 'Дальше'} onPress={next} size="lg" fullWidth />
      </View>
    </Modal>
  );
}

function LegendItem({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={styles.legendIcon}>
        <Ionicons name={icon} size={20} color={colors.textPrimary} />
      </View>
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(8, 5, 4, 0.94)',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  text: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  legendTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  legendIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendLabel: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
