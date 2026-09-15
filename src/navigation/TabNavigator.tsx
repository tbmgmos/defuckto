import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from './types';
import { DiscoveryScreen } from '../screens/DiscoveryScreen';
import { FactsFeedScreen } from '../screens/FactsFeedScreen';
import { MessagesListScreen } from '../screens/MessagesListScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Discovery: { active: 'flame', inactive: 'flame-outline' },
  FactsFeed: { active: 'bulb', inactive: 'bulb-outline' },
  Messages: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

const LABELS: Record<keyof TabParamList, string> = {
  Discovery: 'Знакомства',
  FactsFeed: 'Факты',
  Messages: 'Сообщения',
  Profile: 'Профиль',
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
      <Tab.Screen name="Messages" component={MessagesListScreen} />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}
