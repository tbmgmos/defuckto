import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { Avatar } from '../components/Avatar';
import { UserBadges } from '../components/UserBadges';
import { useChatStore } from '../stores/useChatStore';
import { useToastStore } from '../stores/useToastStore';
import { sendChatMessage } from '../stores/actions';
import { getOtherParticipant } from '../data/conversations';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { colors, radius, spacing, typography, touchTarget } from '../theme';
import { formatClockTime } from '../utils/date';
import { Message } from '../models';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { conversationId, draft: initialDraft } = route.params;
  const insets = useSafeAreaInsets();
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === conversationId));
  const showToast = useToastStore((s) => s.show);
  const [draft, setDraft] = useState(initialDraft ?? '');
  const listRef = useRef<FlatList<Message>>(null);

  const otherId = conversation ? getOtherParticipant(conversation, CURRENT_USER_ID) : undefined;
  const other = otherId ? getUserById(otherId) : undefined;

  if (!conversation || !other) {
    return (
      <View style={styles.missing}>
        <Text style={typography.body}>Диалог не найден.</Text>
      </View>
    );
  }

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    try {
      await sendChatMessage(conversationId, text);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      setDraft(text);
      showToast(e instanceof Error ? e.message : 'Не получилось отправить сообщение', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={navigation.goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Назад" style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('UserProfile', { userId: other.id })}
          style={styles.profileLink}
          accessibilityRole="button"
          accessibilityLabel={`Профиль: ${other.name}`}
        >
          <Avatar seed={other.photoSeed} name={other.name} photoUri={other.photoUri} size={44} />
          <View style={styles.profileText}>
            <View style={styles.nameRow}>
              <Text style={typography.headline}>{other.name}</Text>
              <UserBadges user={other} size={14} />
            </View>
            <Text style={styles.meta}>
              {other.age}, {other.city}
            </Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={conversation.messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => {
          const mine = item.senderId === CURRENT_USER_ID;
          return (
            <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[typography.body, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>{item.text}</Text>
              </View>
              <Text style={styles.time}>{formatClockTime(item.createdAt)}</Text>
            </View>
          );
        }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Написать сообщение..."
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          multiline
          accessibilityLabel="Новое сообщение"
        />
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim()}
          style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Отправить"
        >
          <Ionicons name="arrow-up" size={20} color={colors.onAccent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    marginLeft: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubbleRow: {
    maxWidth: '80%',
    marginBottom: spacing.xs,
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleRowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: {
    color: colors.onAccent,
  },
  bubbleTextTheirs: {
    color: colors.textPrimary,
  },
  time: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    ...typography.body,
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: touchTarget.min / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
