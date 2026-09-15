import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface CoinGlyphProps {
  size?: number;
  color?: string;
}

/** Inline currency mark — used next to a number wherever a price or balance is shown. */
export function CoinGlyph({ size = 14, color = colors.accentText }: CoinGlyphProps) {
  return <Ionicons name="ellipse" size={size} color={color} />;
}
