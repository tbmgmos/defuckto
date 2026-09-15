import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Discovery: undefined;
  FactsFeed: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  UserProfile: { userId: string };
  Chat: { conversationId: string };
  AddFact: undefined;
  Wallet: undefined;
  GuessGame: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
