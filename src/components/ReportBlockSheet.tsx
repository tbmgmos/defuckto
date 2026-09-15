import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing, typography, touchTarget } from '../theme';

interface ReportBlockSheetProps {
  visible: boolean;
  userName: string;
  onClose: () => void;
  onReportFact: (reason: string) => void;
  onReportUser: (reason: string) => void;
  onBlock: () => void;
}

const REASONS = ['Неприемлемый контент', 'Похоже на обман', 'Личные данные третьих лиц', 'Другое'];

export function ReportBlockSheet({ visible, userName, onClose, onReportFact, onReportUser, onBlock }: ReportBlockSheetProps) {
  const [mode, setMode] = useState<'menu' | 'reportFact' | 'reportUser'>('menu');

  const close = () => {
    setMode('menu');
    onClose();
  };

  const pickReason = (reason: string) => {
    if (mode === 'reportFact') onReportFact(reason);
    if (mode === 'reportUser') onReportUser(reason);
    close();
  };

  return (
    <BottomSheet visible={visible} onClose={close} accessibilityLabel="Действия">
      {mode === 'menu' ? (
        <View style={styles.list}>
          <MenuRow label="Пожаловаться на факт" onPress={() => setMode('reportFact')} />
          <MenuRow label={`Пожаловаться на ${userName}`} onPress={() => setMode('reportUser')} />
          <MenuRow label={`Заблокировать ${userName}`} danger onPress={() => { onBlock(); close(); }} />
          <MenuRow label="Отмена" onPress={close} />
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={[typography.title2, styles.reasonTitle]}>В чём проблема?</Text>
          {REASONS.map((reason) => (
            <MenuRow key={reason} label={reason} onPress={() => pickReason(reason)} />
          ))}
        </View>
      )}
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
    paddingBottom: spacing.md,
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
  reasonTitle: {
    marginBottom: spacing.sm,
  },
});
