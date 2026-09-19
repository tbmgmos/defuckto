import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from './types';
import { DiscoveryScreen } from '../screens/DiscoveryScreen';
import { FactsFeedScreen } from '../screens/FactsFeedScreen';
import { MessagesListScreen } from '../screens/MessagesListScreen';
import { TopScreen } from '../screens/TopScreen';
import { AppHeader } from '../components/AppHeader';
import { WelcomeTour } from '../components/WelcomeTour';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Discovery: { active: 'search', inactive: 'search-outline' },
  FactsFeed: { active: 'bulb', inactive: 'bulb-outline' },
  Top: { active: 'trophy', inactive: 'trophy-outline' },
  Messages: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
};

const LABELS: Record<keyof TabParamList, string> = {
  Discovery: 'Поиск',
  FactsFeed: 'Факты',
  Top: 'ТОП 100',
  Messages: 'Сообщения',
};

export function TabNavigator() {
  return (
    <>
    <Tab.Navigator
      initialRouteName="Top"
      screenOptions={({ route }) => ({
        header: () => <AppHeader />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={focused ? ICONS[route.name].active : ICONS[route.name].inactive} size={size} color={color} />
        ),
        tabBarLabel: LABELS[route.name],
      })}
    >
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="FactsFeed" component={FactsFeedScreen} />
      <Tab.Screen name="Top" component={TopScreen} />
      <Tab.Screen name="Messages" component={MessagesListScreen} />
    </Tab.Navigator>
    <WelcomeTour />
    </>
  );
}
