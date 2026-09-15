import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme';

interface VerificationSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

// No real camera/liveness check here — see verificationService for why.
// The point of this UI is the shape of the flow (start → checking →
// badge), ready to swap the middle step for a real SDK call later.
export function VerificationSheet({ visible, onClose, onSubmit }: VerificationSheetProps) {
  const [stage, setStage] = useState<'intro' | 'checking' | 'done'>('intro');

  const handleClose = () => {
    setStage('intro');
    onClose();
  };

  const start = async () => {
    setStage('checking');
    await onSubmit();
    setStage('done');
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Верификация профиля">
      {stage === 'intro' && (
        <View style={styles.center}>
          <Ionicons name="shield-checkmark-outline" size={40} color={colors.accentText} />
          <Text style={[typography.title2, styles.title]}>Верифицировать профиль</Text>
          <Text style={[typography.body, styles.body]}>
            В полной версии здесь была бы проверка селфи и живости. В демо мы просто отмечаем профиль как проверенный.
          </Text>
          <Button label="Начать проверку" onPress={start} size="lg" fullWidth style={styles.cta} />
          <Button label="Не сейчас" onPress={handleClose} variant="ghost" size="lg" fullWidth />
        </View>
      )}

      {stage === 'checking' && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[typography.body, styles.checkingText]}>Проверяем…</Text>
        </View>
      )}

      {stage === 'done' && (
        <View style={styles.center}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={[typography.title2, styles.title]}>Профиль верифицирован</Text>
          <Text style={[typography.body, styles.body]}>Теперь рядом с твоим именем будет значок доверия.</Text>
          <Button label="Готово" onPress={handleClose} size="lg" fullWidth style={styles.cta} />
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  title: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  cta: {
    marginBottom: spacing.xs,
  },
  checkingText: {
    marginTop: spacing.md,
  },
});
