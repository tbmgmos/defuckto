import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastHost } from './src/components/ToastHost';
import { MutualInterestOverlay } from './src/components/MutualInterestOverlay';
import { useOnboardingStore } from './src/stores/useOnboardingStore';
import { bootstrapApp, simulateIncomingActivity } from './src/stores/actions';
import { notificationService } from './src/services/notificationService';
import { colors } from './src/theme';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

// Loosely simulates other people unlocking your facts while you use the
// app (spec §19's "Как заработать" loop). Random cadence so it never
// feels mechanical.
const SIMULATION_MIN_MS = 45_000;
const SIMULATION_MAX_MS = 90_000;

export default function App() {
  const [ready, setReady] = useState(false);
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkStatus);
  const simulationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      await Promise.all([checkOnboardingStatus(), bootstrapApp()]);
      setReady(true);
      // Fire-and-forget — a denied/ignored permission just means notify() stays a no-op.
      void notificationService.requestPermission();
    })();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    if (!ready) return;

    const scheduleNext = () => {
      const delay = SIMULATION_MIN_MS + Math.random() * (SIMULATION_MAX_MS - SIMULATION_MIN_MS);
      simulationTimer.current = setTimeout(async () => {
        await simulateIncomingActivity();
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    return () => {
      if (simulationTimer.current) clearTimeout(simulationTimer.current);
    };
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>DEFUCKTO</Text>
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
          <ToastHost />
          <MutualInterestOverlay />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 20,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  spinner: {
    marginTop: 4,
  },
});
