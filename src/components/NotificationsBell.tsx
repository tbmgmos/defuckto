import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import { formatRelativeTime } from '../utils/date';
import { AppNotification } from '../models';

export function NotificationsBell() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const show = () => {
    setOpen(true);
    if (unreadCount > 0) markAllRead();
  };

  return (
    <>
      <Pressable
        onPress={show}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={unreadCount > 0 ? `Уведомления, непрочитанных: ${unreadCount}` : 'Уведомления'}
      >
        <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} accessibilityLabel="Уведомления">
        <Text style={typography.title2}>Уведомления</Text>
        {notifications.length === 0 ? (
          <Text style={styles.empty}>Пока ничего нет.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(n) => n.id}
            style={styles.list}
            renderItem={({ item }) => <NotificationRow notification={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </BottomSheet>
    </>
  );
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={notification.icon as React.ComponentProps<typeof Ionicons>['name']} size={17} color={colors.textSecondary} />
      </View>
      <View style={styles.rowTextCol}>
        <Text style={typography.body}>{notification.title}</Text>
        <Text style={styles.rowTime}>{formatRelativeTime(notification.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: touchTarget.min / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onAccent,
  },
  empty: {
    ...typography.subhead,
    color: colors.textTertiary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  list: {
    marginTop: spacing.md,
    maxHeight: 420,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    flex: 1,
    gap: 2,
  },
  rowTime: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
