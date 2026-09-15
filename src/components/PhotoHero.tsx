import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

interface PhotoHeroProps {
  seed: string;
  name: string;
  height: number;
  borderRadius?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Editorial stand-in for a profile photo: a bold gradient field with a
 * giant watermark initial, scrimmed at the bottom so overlaid text stays
 * legible. Same no-network rationale as Avatar (§34).
 */
export function PhotoHero({ seed, name, height, borderRadius = radius.xl, children, style }: PhotoHeroProps) {
  const gradient = useMemo(() => {
    const idx = hashSeed(seed) % colors.avatarGradients.length;
    return colors.avatarGradients[idx];
  }, [seed]);

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={[{ height, borderRadius, overflow: 'hidden' }, style]}>
      <LinearGradient colors={gradient} start={{ x: 0.15, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill}>
        <Text style={[styles.watermark, { fontSize: height * 0.8, lineHeight: height * 0.85 }]}>{initial}</Text>
      </LinearGradient>
      <LinearGradient
        colors={['rgba(10,10,11,0)', 'rgba(10,10,11,0.75)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children ? <View style={styles.overlay}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    right: -8,
    bottom: -18,
    color: 'rgba(255,255,255,0.14)',
    fontWeight: '900',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
  },
});
