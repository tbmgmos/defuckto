import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { useChatStore } from '../stores/useChatStore';
import { getOtherParticipant } from '../data/conversations';
import { getUserById, CURRENT_USER_ID } from '../data/users';
import { colors, spacing, typography } from '../theme';
import { formatRelativeTime } from '../utils/date';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Messages'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MessagesListScreen({ navigation }: Props) {
  const conversations = useChatStore((s) => s.conversations);

  return (
    <View style={styles.root}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<ScreenHeader title="Сообщения" onBalancePress={() => navigation.navigate('Wallet')} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const otherId = getOtherParticipant(item, CURRENT_USER_ID);
          const other = getUserById(otherId);
          if (!other) return null;
          const lastMessage = item.messages[item.messages.length - 1];
          return (
            <View style={styles.cardWrap}>
              <Card onPress={() => navigation.navigate('Chat', { conversationId: item.id })} accessibilityLabel={`Диалог с ${other.name}`}>
                <View style={styles.row}>
                  <Avatar seed={other.photoSeed} name={other.name} size={52} />
                  <View style={styles.textCol}>
                    <View style={styles.topRow}>
                      <Text style={typography.headline}>{other.name}</Text>
                      {lastMessage ? (
                        <Text style={styles.time}>{formatRelativeTime(lastMessage.createdAt)}</Text>
                      ) : null}
                    </View>
                    <Text style={[typography.subhead, styles.preview]} numberOfLines={1}>
                      {lastMessage ? lastMessage.text : 'Начните разговор'}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[typography.subhead, styles.empty]}>Пока нет диалогов. Открой чей-то факт, чтобы начать.</Text>
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
