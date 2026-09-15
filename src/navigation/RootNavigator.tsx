import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { AddFactScreen } from '../screens/AddFactScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { colors } from '../theme';
import { useOnboardingStore } from '../stores/useOnboardingStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  return (
    <Stack.Navigator
      initialRouteName={hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen
        name="AddFact"
        component={AddFactScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
