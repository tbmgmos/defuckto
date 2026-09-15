import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface VerifiedBadgeProps {
  size?: number;
}

export function VerifiedBadge({ size = 15 }: VerifiedBadgeProps) {
  return (
    <Ionicons
      name="checkmark-circle"
      size={size}
      color={colors.accentText}
      accessibilityLabel="Профиль верифицирован"
    />
  );
}
