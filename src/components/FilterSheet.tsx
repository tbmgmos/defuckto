import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Chip } from './Chip';
import { colors, spacing, typography } from '../theme';
import { DiscoveryFilters, InterestKey } from '../models';
import { INTERESTS } from '../data/interests';

interface FilterSheetProps {
  visible: boolean;
  filters: DiscoveryFilters;
  cities: string[];
  onClose: () => void;
  onAgeChange: (minAge: number, maxAge: number) => void;
  onCityChange: (city: string | null) => void;
  onToggleInterest: (interest: InterestKey) => void;
  onReset: () => void;
}

const ALL_INTERESTS = Object.values(INTERESTS);

export function FilterSheet({
  visible,
  filters,
  cities,
  onClose,
  onAgeChange,
  onCityChange,
  onToggleInterest,
  onReset,
}: FilterSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Фильтры">
      <Text style={typography.title2}>Фильтры</Text>

      <Text style={[typography.eyebrow, styles.sectionTitle]}>
        Возраст: {filters.minAge}–{filters.maxAge}
      </Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>От</Text>
        <Slider
          style={styles.slider}
          minimumValue={18}
          maximumValue={60}
          step={1}
          value={filters.minAge}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
          onValueChange={(v) => onAgeChange(Math.min(v, filters.maxAge), filters.maxAge)}
        />
      </View>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>До</Text>
        <Slider
          style={styles.slider}
          minimumValue={18}
          maximumValue={60}
          step={1}
          value={filters.maxAge}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
          onValueChange={(v) => onAgeChange(filters.minAge, Math.max(v, filters.minAge))}
        />
      </View>

      <Text style={[typography.eyebrow, styles.sectionTitle]}>Город</Text>
      <View style={styles.chipsRow}>
        <Chip label="Любой" selected={filters.city === null} onPress={() => onCityChange(null)} />
        {cities.map((city) => (
          <Chip key={city} label={city} selected={filters.city === city} onPress={() => onCityChange(city)} />
        ))}
      </View>

      <Text style={[typography.eyebrow, styles.sectionTitle]}>Интересы</Text>
      <View style={styles.chipsRow}>
        {ALL_INTERESTS.map((i) => (
          <Chip
            key={i.key}
            label={i.label}
            emoji={i.emoji}
            selected={filters.interests.includes(i.key)}
            onPress={() => onToggleInterest(i.key)}
          />
        ))}
      </View>

      <Button label="Показать" onPress={onClose} size="lg" fullWidth style={styles.apply} />
      <Button label="Сбросить фильтры" onPress={onReset} variant="ghost" size="lg" fullWidth />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sliderLabel: {
    ...typography.subhead,
    width: 28,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  apply: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
});
