import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { TeaserRow } from '../components/TeaserRow';
import { useChatStore } from '../stores/useChatStore';
import { useTeasersStore } from '../stores/useTeasersStore';
import { useToastStore } from '../stores/useToastStore';
import { revealTeaser } from '../stores/actions';
import { chatService } from '../services';
import { getOtherParticipant } from '../data/conversations';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { colors, spacing, typography } from '../theme';
import { formatRelativeTime } from '../utils/date';
import { Conversation } from '../models';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Messages'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const otherId = getOtherParticipant(conversation, CURRENT_USER_ID);
  const other = getUserById(otherId);
  if (!other) return null;
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  return (
    <View style={styles.cardWrap}>
      <Card onPress={onPress} accessibilityLabel={`Диалог с ${other.name}`}>
        <View style={styles.row}>
          <Avatar seed={other.photoSeed} name={other.name} size={52} />
          <View style={styles.textCol}>
            <View style={styles.topRow}>
              <Text style={typography.headline}>{other.name}</Text>
              {lastMessage ? <Text style={styles.time}>{formatRelativeTime(lastMessage.createdAt)}</Text> : null}
            </View>
            <Text style={[typography.subhead, styles.preview]} numberOfLines={1}>
              {lastMessage ? lastMessage.text : 'Начните разговор'}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

export function MessagesListScreen({ navigation }: Props) {
  const conversations = useChatStore((s) => s.conversations);
  const teasers = useTeasersStore((s) => s.teasers);
  const showToast = useToastStore((s) => s.show);
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const requests = conversations.filter((c) => chatService.isPendingRequest(c, CURRENT_USER_ID));
  const regular = conversations.filter((c) => !chatService.isPendingRequest(c, CURRENT_USER_ID));

  const handleReveal = async (teaserId: string) => {
    setRevealingId(teaserId);
    try {
      const name = await revealTeaser(teaserId);
      showToast(`Это ${name}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Не получилось', 'error');
    } finally {
      setRevealingId(null);
    }
  };

  const openChat = (conversationId: string) => navigation.navigate('Chat', { conversationId });

  return (
    <View style={styles.root}>
      <FlatList
        data={regular}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <ScreenHeader title="Сообщения" onBalancePress={() => navigation.navigate('Wallet')} />
            {teasers.length > 0 ? (
              <View style={styles.section}>
                <Text style={[typography.eyebrow, styles.sectionTitle]}>Кто-то заинтересовался</Text>
                {teasers.map((t) => (
                  <TeaserRow
                    key={t.id}
                    teaser={t}
                    onReveal={() => handleReveal(t.id)}
                    onOpenProfile={() => navigation.navigate('UserProfile', { userId: t.curiousUserId })}
                    revealing={revealingId === t.id}
                  />
                ))}
              </View>
            ) : null}
            {requests.length > 0 ? (
              <View style={styles.section}>
                <Text style={[typography.eyebrow, styles.sectionTitle]}>Запросы</Text>
                <Text style={styles.sectionHint}>Ответь, чтобы начать общение</Text>
                {requests.map((c) => (
                  <ConversationRow key={c.id} conversation={c} onPress={() => openChat(c.id)} />
                ))}
              </View>
            ) : null}
            {requests.length > 0 && regular.length > 0 ? (
              <Text style={[typography.eyebrow, styles.sectionTitle, styles.dialogsTitle]}>Диалоги</Text>
            ) : null}
          </>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ConversationRow conversation={item} onPress={() => openChat(item.id)} />}
        ListEmptyComponent={
          requests.length === 0 ? (
            <Text style={[typography.subhead, styles.empty]}>Пока нет диалогов. Открой чей-то факт, чтобы начать.</Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  sectionHint: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    color: colors.textTertiary,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  dialogsTitle: {
    paddingHorizontal: spacing.lg,
  },
  cardWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
  preview: {
    color: colors.textSecondary,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    color: colors.textTertiary,
  },
});
