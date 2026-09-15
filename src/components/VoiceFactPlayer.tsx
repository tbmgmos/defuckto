import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { colors, radius, spacing, typography } from '../theme';

interface VoiceFactPlayerProps {
  uri: string;
  durationSec: number;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceFactPlayer({ uri, durationSec }: VoiceFactPlayerProps) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || status.currentTime >= (status.duration ?? durationSec)) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const progress = status.duration ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <Pressable onPress={toggle} style={styles.row} accessibilityRole="button" accessibilityLabel={status.playing ? 'Пауза' : 'Слушать голосовой факт'}>
      <View style={styles.playButton}>
        <Ionicons name={status.playing ? 'pause' : 'play'} size={16} color={colors.textInverse} />
      </View>
      <View style={styles.waveTrack}>
        <View style={[styles.waveFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.duration}>{formatDuration(durationSec)}</Text>
    </Pressable>
  );
}

// expo-audio's web support for arbitrary local blob URIs recorded via
// expo-audio is inconsistent — this component only ever renders where
// recording actually produced a real uri, so no separate web fallback UI.
export const voiceUnsupportedOnWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  waveFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  duration: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    minWidth: 32,
    textAlign: 'right',
  },
});
