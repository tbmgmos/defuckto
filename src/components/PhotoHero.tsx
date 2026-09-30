import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

interface PhotoHeroProps {
  seed: string;
  name: string;
  photoUri?: string;
  height: number;
  borderRadius?: number;
  children?: React.ReactNode;
  /** Absolutely fills the whole hero (not just the bottom scrim area) — for things like back/menu buttons or a lock overlay that aren't bottom-anchored caption content. */
  fillOverlay?: React.ReactNode;
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
export function PhotoHero({ seed, name, photoUri, height, borderRadius = radius.xl, children, fillOverlay, style }: PhotoHeroProps) {
  const gradient = useMemo(() => {
    const idx = hashSeed(seed) % colors.avatarGradients.length;
    return colors.avatarGradients[idx];
  }, [seed]);

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={[{ height, borderRadius, overflow: 'hidden' }, style]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient colors={gradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill}>
          <Text style={[styles.watermark, { fontSize: height * 0.56, lineHeight: height * 0.6 }]}>{initial}</Text>
        </LinearGradient>
      )}
      <LinearGradient
        colors={['rgba(12,10,8,0)', 'rgba(12,10,8,0.75)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children ? <View style={styles.overlay}>{children}</View> : null}
      {fillOverlay ? <View style={StyleSheet.absoluteFill}>{fillOverlay}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    color: 'rgba(255,255,255,0.10)',
    fontWeight: '800',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
  },
});
