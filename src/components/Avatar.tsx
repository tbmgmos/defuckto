import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

interface AvatarProps {
  seed: string;
  name: string;
  size?: number;
  rounded?: 'circle' | 'card';
  style?: ViewStyle;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/**
 * No network dependency by design — a deterministic gradient + initial per
 * user id. Doubles as the "photo" fallback the spec asks for (§34) and, in
 * this demo, as the only photo treatment at all.
 */
export function Avatar({ seed, name, size = 56, rounded = 'circle', style }: AvatarProps) {
  const gradient = useMemo(() => {
    const idx = hashSeed(seed) % colors.avatarGradients.length;
    return colors.avatarGradients[idx];
  }, [seed]);

  const borderRadius = rounded === 'circle' ? size / 2 : radius.lg;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[
        styles.container,
        { width: size, height: size, borderRadius },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{getInitial(name)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
});
