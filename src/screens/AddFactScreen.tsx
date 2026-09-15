import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { VoiceFactRecorder } from '../components/VoiceFactRecorder';
import { useToastStore } from '../stores/useToastStore';
import { useUsersStore } from '../stores/useUsersStore';
import { publishFact } from '../stores/actions';
import { ADD_FACT_CATEGORY_LIST } from '../data/factCategories';
import { colors, radius, spacing, touchTarget, typography } from '../theme';
import { FactCategory, FactType } from '../models';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFact'>;

const PRICE_OPTIONS = [5, 10, 25, 50];
const MIN_TEXT_LENGTH = 8;
const MIN_CAPTION_LENGTH = 3;

function maskPreview(text: string): string {
  return text.replace(/\S/g, '•');
}

export function AddFactScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);
  const currentUser = useUsersStore((s) => s.currentUser);
  const [factType, setFactType] = useState<FactType>('text');
  const [text, setText] = useState('');
  const [voiceResult, setVoiceResult] = useState<{ uri: string; durationSec: number } | null>(null);
  const [category, setCategory] = useState<FactCategory>('life');
  const [price, setPrice] = useState(10);
  const [publishing, setPublishing] = useState(false);

  const isVoice = factType === 'voice';
  const minLength = isVoice ? MIN_CAPTION_LENGTH : MIN_TEXT_LENGTH;
  const canPublish = text.trim().length >= minLength && (!isVoice || !!voiceResult) && !publishing;

  const handlePublish = async () => {
    if (!currentUser || !canPublish) return;
    setPublishing(true);
    try {
      await publishFact({
        authorId: currentUser.id,
        text,
        category,
        price,
        type: factType,
        audioUri: voiceResult?.uri,
        durationSec: voiceResult?.durationSec,
      });
      showToast('Факт опубликован. Посмотрим, кому станет любопытно.', 'success');
      navigation.goBack();
    } catch {
      showToast('Не получилось опубликовать факт', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={navigation.goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Закрыть" style={styles.closeButton}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={typography.headline}>Новый факт</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.title2}>Что о тебе невозможно угадать?</Text>

        {Platform.OS !== 'web' ? (
          <View style={styles.typeChipsRow}>
            <Chip label="Текст" emoji="✍️" selected={factType === 'text'} onPress={() => setFactType('text')} />
            <Chip label="Голос" emoji="🎙️" selected={factType === 'voice'} onPress={() => setFactType('voice')} />
          </View>
        ) : null}

        {isVoice ? (
          <View style={styles.voiceBlock}>
            <VoiceFactRecorder onChange={setVoiceResult} />
          </View>
        ) : null}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={isVoice ? 'Короткая подпись к голосовому факту...' : 'Расскажи что-нибудь, чего от тебя никто не ожидает...'}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, isVoice && styles.inputCompact]}
          multiline
          maxLength={280}
          accessibilityLabel={isVoice ? 'Подпись к голосовому факту' : 'Текст факта'}
        />
        <Text style={styles.safetyHint}>
          Не указывай адреса, пароли, точную геолокацию и данные третьих лиц — такие факты не пройдут модерацию.
        </Text>

        <Text style={[typography.eyebrow, styles.sectionTitle]}>Категория</Text>
        <View style={styles.chipsRow}>
          {ADD_FACT_CATEGORY_LIST.map((c) => (
            <Chip key={c.key} label={c.label} emoji={c.emoji} selected={category === c.key} onPress={() => setCategory(c.key)} />
          ))}
        </View>

        <Text style={[typography.eyebrow, styles.sectionTitle]}>Стоимость открытия</Text>
        <View style={styles.chipsRow}>
          {PRICE_OPTIONS.map((p) => (
            <Chip key={p} label={`${p} 🪙`} selected={price === p} onPress={() => setPrice(p)} />
          ))}
        </View>

        <Text style={[typography.eyebrow, styles.sectionTitle]}>Предпросмотр</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>🔒 Так твой факт увидят другие.</Text>
          <Text style={[typography.body, styles.previewText]} numberOfLines={2}>
            {isVoice ? '🎙️ Голосовой факт' : text.trim() ? maskPreview(text.trim()) : '•••• •••••••• •• •••••• ••••'}
          </Text>
          <Text style={styles.previewPrice}>{price} 🪙</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Опубликовать" onPress={handlePublish} disabled={!canPublish} size="lg" fullWidth />
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  typeChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  voiceBlock: {
    marginTop: spacing.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 110,
    marginTop: spacing.md,
    textAlignVertical: 'top',
  },
  inputCompact: {
    minHeight: 60,
  },
  safetyHint: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: spacing.xs,
    color: colors.textTertiary,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  previewLabel: {
    ...typography.caption,
    textTransform: 'none',
    letterSpacing: 0,
  },
  previewText: {
    color: colors.textSecondary,
  },
  previewPrice: {
    ...typography.headline,
    color: colors.accentText,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
