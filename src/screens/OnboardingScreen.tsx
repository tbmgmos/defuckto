import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { Button } from '../components/Button';
import { CoinGlyph } from '../components/CoinGlyph';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import { STARTER_BALANCE } from '../services/localDatabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    gradient: colors.avatarGradients[0],
    eyebrow: 'DEFUCKTO',
    title: 'Не всё интересное видно на фото.',
    cta: 'Продолжить',
  },
  {
    gradient: colors.avatarGradients[1],
    eyebrow: 'DEFUCKTO',
    title: 'Узнавай людей через факты.',
    cta: 'Продолжить',
  },
  {
    gradient: colors.avatarGradients[3],
    eyebrow: 'DEFUCKTO',
    title: 'Рассказывай о себе и получай монеты.',
    cta: 'Начать',
  },
] as const;

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const complete = useOnboardingStore((s) => s.complete);
  // Guards against a double-tap racing the 140ms transition and reading a
  // stale `step` — everything here reads/writes this ref instead of state.
  const isAdvancing = useRef(false);

  const goNext = () => {
    if (isAdvancing.current) return;
    isAdvancing.current = true;

    if (step >= SLIDES.length - 1) {
      isAdvancing.current = false;
      finishOnboarding();
      return;
    }

    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, SLIDES.length - 1));
      isAdvancing.current = false;
    }, 140);
  };

  const finishOnboarding = async () => {
    setShowWelcome(true);
    await complete();
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }, 1900);
  };

  if (showWelcome) {
    return <WelcomeSplash />;
  }

  const slide = SLIDES[step] ?? SLIDES[SLIDES.length - 1];

  return (
    <View style={styles.root}>
      <LinearGradient colors={slide.gradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(10,10,11,0.15)', 'rgba(10,10,11,0.9)']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Animated.View style={[styles.content, { opacity: fade }]}>
          <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
          <Text style={styles.title}>{slide.title}</Text>
        </Animated.View>

        <Button label={slide.cta} onPress={goNext} size="lg" fullWidth style={styles.cta} />
      </SafeAreaView>
    </View>
  );
}

function WelcomeSplash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={[styles.root, styles.welcomeRoot]}>
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center', paddingHorizontal: spacing.xxl }}>
        <Text style={styles.welcomeBrand}>DEFUCKTO</Text>
        <Text style={styles.welcomeTitle}>Добро пожаловать в DEFUCKTO.</Text>
        <Text style={styles.welcomeSubtitle}>Здесь люди немного интереснее своих фотографий.</Text>
        <View style={styles.welcomeCoin}>
          <Text style={styles.welcomeCoinText}>
            +{STARTER_BALANCE} <CoinGlyph size={15} color={colors.accentText} />
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.lg,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xxl,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    fontSize: Math.min(38, width * 0.1),
    maxWidth: 320,
  },
  cta: {
    marginBottom: spacing.sm,
  },
  welcomeRoot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeBrand: {
    ...typography.eyebrow,
    color: colors.accentText,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    ...typography.title1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.subhead,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  welcomeCoin: {
    backgroundColor: colors.accentMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  welcomeCoinText: {
    ...typography.headline,
    color: colors.accentText,
  },
});
