import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { colors, spacing, typography } from '../theme';
import { useInterestStore } from '../stores/useInterestStore';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { chatService } from '../services';
import { useChatStore } from '../stores/useChatStore';
import { RootStackParamList } from '../navigation/types';

/** Mounted once at the app root — listens for interestService events. */
export function MutualInterestOverlay() {
  const event = useInterestStore((s) => s.pendingEvent);
  const dismiss = useInterestStore((s) => s.dismiss);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const otherUser = event ? getUserById(event.otherUserId) : undefined;

  const startChat = async () => {
    if (!event) return;
    // Just opens (or finds) the conversation — no fabricated message from
    // the other side. The starter line goes into *your* composer as a
    // suggestion, not a fake reply that was never actually sent by them.
    const conversation = await chatService.openConversation(CURRENT_USER_ID, event.otherUserId);
    useChatStore.getState().upsertConversation(conversation);
    dismiss();
    navigation.navigate('Chat', { conversationId: conversation.id, draft: 'Привет! Мне стало любопытно 👀' });
  };

  return (
    <BottomSheet visible={!!event} onClose={dismiss} accessibilityLabel="Похоже, тебе интересно">
      <View style={styles.content}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={[typography.title2, styles.title]}>
          Похоже, тебе правда интересно{otherUser ? ` — ${otherUser.name}` : ' этому человеку'}.
        </Text>
        <Text style={styles.subtitle}>Хочешь написать первым?</Text>
        <Button label="Написать первым" onPress={startChat} size="lg" fullWidth style={styles.cta} />
        <Button label="Позже" onPress={dismiss} variant="ghost" size="lg" fullWidth />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sparkle: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.subhead,
    marginBottom: spacing.lg,
  },
  cta: {
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
});
