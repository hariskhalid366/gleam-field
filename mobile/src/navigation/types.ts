import type { NativeStackScreenProps } from "@react-navigation/native-stack";

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
  Dashboard: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
