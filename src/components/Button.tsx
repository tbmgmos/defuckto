import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { haptics } from '../utils/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  fullWidth,
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    haptics.tap();
    onPress();
  };

  const containerStyle = [
    stylesFor(variant, size).container,
    fullWidth && { alignSelf: 'stretch' as const },
    disabled && styles.disabled,
    style,
  ];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { alignSelf: 'stretch' }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !!disabled }}
        hitSlop={6}
        style={containerStyle}
      >
        {icon}
        <Text style={stylesFor(variant, size).label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function stylesFor(variant: Variant, size: Size) {
  const height = size === 'lg' ? 56 : 48;
  const base: ViewStyle = {
    height,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  };

  switch (variant) {
    case 'primary':
      return {
        container: { ...base, backgroundColor: colors.accent },
        label: { ...typography.bodyMedium, color: colors.textInverse },
      };
    case 'secondary':
      return {
        container: { ...base, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderStrong },
        label: { ...typography.bodyMedium, color: colors.textPrimary },
      };
    case 'ghost':
      return {
        container: { ...base, backgroundColor: 'transparent' },
        label: { ...typography.bodyMedium, color: colors.textSecondary },
      };
    case 'danger':
      return {
        container: { ...base, backgroundColor: colors.dangerMuted },
        label: { ...typography.bodyMedium, color: colors.danger },
      };
  }
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
});
