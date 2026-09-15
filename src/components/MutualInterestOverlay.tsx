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
    // A friendly opener from the other person, so the chat isn't empty
    // when the user arrives.
    const conversation = await chatService.sendMessageTo(CURRENT_USER_ID, event.otherUserId, 'Привет! Мне стало любопытно 👀');
    useChatStore.getState().upsertConversation(conversation);
    dismiss();
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  return (
    <BottomSheet visible={!!event} onClose={dismiss} accessibilityLabel="Взаимный интерес">
      <View style={styles.content}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={[typography.title2, styles.title]}>Кажется, вы заинтересовали друг друга.</Text>
        <Text style={styles.subtitle}>Взаимный интерес{otherUser ? ` · ${otherUser.name}` : ''}</Text>
        <Button label="Начать общение" onPress={startChat} size="lg" fullWidth style={styles.cta} />
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
