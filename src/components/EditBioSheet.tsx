import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';

interface EditBioSheetProps {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (bio: string) => void;
}

const BIO_MAX_LENGTH = 160;

export function EditBioSheet({ visible, initialValue, onClose, onSave }: EditBioSheetProps) {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    if (visible) setText(initialValue);
  }, [visible, initialValue]);

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Редактировать о себе">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={typography.title2}>О себе</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Расскажи что-нибудь о себе"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          multiline
          maxLength={BIO_MAX_LENGTH}
          accessibilityLabel="Текст о себе"
          autoFocus
        />
        <Text style={styles.counter}>{text.length}/{BIO_MAX_LENGTH}</Text>
        <Button label="Сохранить" onPress={handleSave} size="lg" fullWidth style={styles.save} />
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
    textAlignVertical: 'top',
  },
  counter: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  save: {
    marginBottom: spacing.xs,
  },
});
