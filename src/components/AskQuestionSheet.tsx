import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { QUESTION_PRICE } from '../services/economyService';

interface AskQuestionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  loading?: boolean;
  /** Free questions left today (see economyService.FREE_QUESTIONS_PER_DAY) — drives the button label. */
  freeRemaining?: number;
}

export function AskQuestionSheet({ visible, onClose, onSend, loading, freeRemaining = 0 }: AskQuestionSheetProps) {
  const [text, setText] = useState('');

  const handleClose = () => {
    setText('');
    onClose();
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} accessibilityLabel="Задать вопрос">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={typography.title2}>Что хочешь узнать?</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Почему ты вообще оказалась в этом поезде?"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          multiline
          maxLength={240}
          accessibilityLabel="Текст вопроса"
        />
        <Button
          label={
            loading
              ? 'Отправляем…'
              : freeRemaining > 0
                ? `Отправить бесплатно · ещё ${freeRemaining} сегодня`
                : `Отправить · ${QUESTION_PRICE} 🪙`
          }
          onPress={handleSend}
          size="lg"
          fullWidth
          disabled={loading || !text.trim()}
          style={styles.send}
        />
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 96,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlignVertical: 'top',
  },
  send: {
    marginBottom: spacing.xs,
  },
});
