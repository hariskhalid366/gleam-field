import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type MainTabParamList = {
  Dashboard: undefined;
  Jobs: { filter?: "requests" | "active" | "upcoming" | "completed" | "cancelled" } | undefined;
  Calendar: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OtpVerification: { destination: string; purpose: "reset" | "signup" };
  ResetPassword: { token: string };
  Registration: undefined;
  ApplicationSubmitted: undefined;
  WaitingApproval: undefined;
  Rejected: undefined;
  Approved: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  JobDetail: { jobId: string };
  Chat: { conversationId: string };
  Notifications: undefined;
  Earnings: undefined;
  Documents: undefined;
  Settings: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
