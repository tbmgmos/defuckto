import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { useFactsStore } from '../stores/useFactsStore';
import { getOtherUsers } from '../data/users';
import { Fact, User } from '../models';
import { haptics } from '../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'GuessGame'>;

interface Round {
  fact: Fact;
  options: User[];
  correctId: string;
}

function pickRound(facts: Fact[]): Round | null {
  const pool = facts.filter((f) => f.price > 0);
  if (pool.length === 0) return null;
  const fact = pool[Math.floor(Math.random() * pool.length)];
  const others = getOtherUsers().filter((u) => u.id !== fact.authorId);
  const decoys = [...others].sort(() => Math.random() - 0.5).slice(0, 2);
  const correctAuthor = getOtherUsers().find((u) => u.id === fact.authorId);
  if (!correctAuthor) return null;
  const options = [...decoys, correctAuthor].sort(() => Math.random() - 0.5);
  return { fact, options, correctId: correctAuthor.id };
}

export function GuessGameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const facts = useFactsStore((s) => s.facts);
  const [round, setRound] = useState<Round | null>(() => pickRound(facts));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const nextRound = useCallback(() => {
    setRound(pickRound(facts));
    setPicked(null);
  }, [facts]);

  const handlePick = (userId: string) => {
    if (picked || !round) return;
    setPicked(userId);
    const correct = userId === round.correctId;
    haptics[correct ? 'success' : 'warning']();
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const resultLabel = useMemo(() => {
    if (!picked || !round) return null;
    return picked === round.correctId ? 'Точно!' : 'Не в этот раз.';
  }, [picked, round]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={navigation.goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Закрыть" style={styles.closeButton}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={typography.headline}>Угадай, чей факт</Text>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>Счёт: {score}</Text>
        {streak > 1 ? (
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={16} color={colors.accentText} />
            <Text style={styles.streakText}>серия {streak}</Text>
          </View>
        ) : null}
      </View>

      {round ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.factCard}>
            <Text style={styles.factQuote}>«{round.fact.text}»</Text>
          </View>

          <Text style={[typography.eyebrow, styles.optionsTitle]}>Кто это написал?</Text>
          <View style={styles.options}>
            {round.options.map((user) => {
              const isPicked = picked === user.id;
              const isCorrect = picked && user.id === round.correctId;
              const isWrongPick = isPicked && user.id !== round.correctId;
              return (
                <Pressable
                  key={user.id}
                  onPress={() => handlePick(user.id)}
                  style={[
                    styles.optionRow,
                    isCorrect && styles.optionCorrect,
                    isWrongPick && styles.optionWrong,
                  ]}
                  accessibilityRole="button"
                  disabled={!!picked}
                >
                  <Avatar seed={user.photoSeed} name={user.name} size={40} />
                  <Text style={typography.bodyMedium}>{user.name}</Text>
                </Pressable>
              );
            })}
          </View>

          {resultLabel ? (
            <View style={styles.resultBlock}>
              <Text style={styles.resultText}>{resultLabel}</Text>
              <Button label="Следующий" onPress={nextRound} size="lg" fullWidth />
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <Text style={typography.body}>Пока недостаточно фактов для игры.</Text>
        </View>
      )}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  scoreText: {
    ...typography.bodyMedium,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    ...typography.bodyMedium,
    color: colors.accentText,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  factCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  factQuote: {
    ...typography.title2,
    fontSize: 19,
  },
  optionsTitle: {
    marginTop: spacing.sm,
  },
  options: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successMuted,
  },
  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  resultBlock: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  resultText: {
    ...typography.headline,
    textAlign: 'center',
  },
});
