import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Chip } from './Chip';
import { colors, spacing, touchTarget, typography } from '../theme';
import { DiscoveryFilters, Gender, InterestKey } from '../models';
import { INTERESTS } from '../data/interests';

type FlagKey = 'onlyTop' | 'onlyCompatible' | 'onlyVerified' | 'onlyHot' | 'onlyFriendship';

interface FilterSheetProps {
  visible: boolean;
  filters: DiscoveryFilters;
  cities: string[];
  onClose: () => void;
  onAgeChange: (minAge: number, maxAge: number) => void;
  onGenderChange: (gender: Gender | null) => void;
  onCityChange: (city: string | null) => void;
  onToggleInterest: (interest: InterestKey) => void;
  onToggleFlag: (flag: FlagKey) => void;
  onReset: () => void;
}

const ALL_INTERESTS = Object.values(INTERESTS);

// "Только премиум" and "Сейчас онлайн" from the plan are left out on purpose:
// there is no honest data behind either yet (see spec notes) and a filter
// that quietly returns nothing would be worse than no filter.
const FLAGS: { key: FlagKey; label: string }[] = [
  { key: 'onlyTop', label: 'Только в ТОПе' },
  { key: 'onlyCompatible', label: 'Из совместимых' },
  { key: 'onlyVerified', label: 'Подтверждённая анкета' },
  { key: 'onlyHot', label: 'С горячими фактами' },
  { key: 'onlyFriendship', label: 'Только дружба' },
];

export function FilterSheet({
  visible,
  filters,
  cities,
  onClose,
  onAgeChange,
  onGenderChange,
  onCityChange,
  onToggleInterest,
  onToggleFlag,
  onReset,
}: FilterSheetProps) {
  const { height } = useWindowDimensions();

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Фильтр">
      <Text style={typography.title2}>Фильтр</Text>

      <ScrollView style={{ maxHeight: height * 0.62 }} showsVerticalScrollIndicator={false}>
        <Text style={[typography.eyebrow, styles.sectionTitle]}>Пол</Text>
        <View style={styles.chipsRow}>
          <Chip label="Любой" selected={filters.gender === null} onPress={() => onGenderChange(null)} />
          <Chip label="Мужской" selected={filters.gender === 'm'} onPress={() => onGenderChange('m')} />
          <Chip label="Женский" selected={filters.gender === 'f'} onPress={() => onGenderChange('f')} />
        </View>

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
              icon={i.icon as React.ComponentProps<typeof Ionicons>['name']}
              selected={filters.interests.includes(i.key)}
              onPress={() => onToggleInterest(i.key)}
            />
          ))}
        </View>

        <Text style={[typography.eyebrow, styles.sectionTitle]}>Показывать</Text>
        {FLAGS.map((flag) => {
          const checked = filters[flag.key];
          return (
            <Pressable
              key={flag.key}
              onPress={() => onToggleFlag(flag.key)}
              style={styles.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={flag.label}
            >
              <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={22}
                color={checked ? colors.accent : colors.textTertiary}
              />
              <Text style={typography.body}>{flag.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Button label="Искать" onPress={onClose} size="lg" fullWidth style={styles.apply} />
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
  checkRow: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  apply: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
});
