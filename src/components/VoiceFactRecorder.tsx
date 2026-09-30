import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { VoiceFactPlayer } from './VoiceFactPlayer';
import { haptics } from '../utils/haptics';

interface VoiceFactRecorderProps {
  onChange: (result: { uri: string; durationSec: number } | null) => void;
}

const MAX_SECONDS = 12;

export function VoiceFactRecorder({ onChange }: VoiceFactRecorderProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [result, setResult] = useState<{ uri: string; durationSec: number } | null>(null);

  useEffect(() => {
    if (recorderState.isRecording && recorderState.durationMillis / 1000 >= MAX_SECONDS) {
      void stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.durationMillis, recorderState.isRecording]);

  const start = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    haptics.press();
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async () => {
    await recorder.stop();
    haptics.tap();
    const durationSec = Math.round(recorderState.durationMillis / 1000);
    if (recorder.uri) {
      const next = { uri: recorder.uri, durationSec: Math.max(1, durationSec) };
      setResult(next);
      onChange(next);
    }
  };

  const discard = () => {
    setResult(null);
    onChange(null);
  };

  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>Нужен доступ к микрофону, чтобы записать голосовой факт.</Text>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <VoiceFactPlayer uri={result.uri} durationSec={result.durationSec} />
        <Pressable onPress={discard} accessibilityRole="button" style={styles.discardButton}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.discardText}>Перезаписать</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={recorderState.isRecording ? stop : start}
        style={[styles.recordButton, recorderState.isRecording && styles.recordButtonActive]}
        accessibilityRole="button"
        accessibilityLabel={recorderState.isRecording ? 'Остановить запись' : 'Начать запись'}
      >
        <Ionicons name={recorderState.isRecording ? 'stop' : 'mic'} size={20} color={colors.onAccent} />
      </Pressable>
      <Text style={styles.hint}>
        {recorderState.isRecording
          ? `Запись… ${Math.round(recorderState.durationMillis / 1000)}с / ${MAX_SECONDS}с`
          : 'Запиши голосовой факт до 12 секунд'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  recordButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: touchTarget.min / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: colors.danger,
  },
  hint: {
    ...typography.subhead,
    flex: 1,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discardText: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.danger,
  },
});
