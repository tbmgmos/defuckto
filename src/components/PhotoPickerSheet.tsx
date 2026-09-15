import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { colors, touchTarget, typography } from '../theme';

interface PhotoPickerSheetProps {
  visible: boolean;
  hasPhoto: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickLibrary: () => void;
  onRemove: () => void;
}

export function PhotoPickerSheet({ visible, hasPhoto, onClose, onPickCamera, onPickLibrary, onRemove }: PhotoPickerSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Фото профиля">
      <View style={styles.list}>
        <MenuRow label="Сделать фото" onPress={() => { onClose(); onPickCamera(); }} />
        <MenuRow label="Выбрать из галереи" onPress={() => { onClose(); onPickLibrary(); }} />
        {hasPhoto ? <MenuRow label="Удалить фото" danger onPress={() => { onClose(); onRemove(); }} /> : null}
        <MenuRow label="Отмена" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

function MenuRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button">
      <Text style={[typography.body, danger && styles.dangerText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 12,
  },
  row: {
    minHeight: touchTarget.min,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dangerText: {
    color: colors.danger,
  },
});
