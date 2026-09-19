import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Discovery: undefined;
  FactsFeed: undefined;
  Top: undefined;
  Messages: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  Profile: undefined;
  UserProfile: { userId: string };
  Chat: { conversationId: string; draft?: string };
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
