import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import type { RootStackParamList } from "./types";
import { MainTabs } from "./MainTabs";

import SplashScreen from "@/screens/auth/SplashScreen";
import OnboardingScreen from "@/screens/auth/OnboardingScreen";
import WelcomeScreen from "@/screens/auth/WelcomeScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import OtpVerificationScreen from "@/screens/auth/OtpVerificationScreen";
import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";
import RegistrationScreen from "@/screens/registration/RegistrationScreen";
import ApplicationSubmittedScreen from "@/screens/verification/ApplicationSubmittedScreen";
import WaitingApprovalScreen from "@/screens/verification/WaitingApprovalScreen";
import RejectedScreen from "@/screens/verification/RejectedScreen";
import ApprovedScreen from "@/screens/verification/ApprovedScreen";
import JobDetailScreen from "@/screens/jobs/JobDetailScreen";
import ChatScreen from "@/screens/messages/ChatScreen";
import NotificationsScreen from "@/screens/main/NotificationsScreen";
import EarningsScreen from "@/screens/profile/EarningsScreen";
import DocumentsScreen from "@/screens/profile/DocumentsScreen";
import SettingsScreen from "@/screens/profile/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * The stack is selected by application status — a technician can never reach
 * the main app until the business owner approves the account.
 */
export function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { status } = useAuth();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {status === "none" ? (
          <Stack.Group>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </Stack.Group>
        ) : status === "submitted" ? (
          <Stack.Group>
            <Stack.Screen name="ApplicationSubmitted" component={ApplicationSubmittedScreen} />
            <Stack.Screen name="WaitingApproval" component={WaitingApprovalScreen} />
          </Stack.Group>
        ) : status === "pending" ? (
          <Stack.Screen name="WaitingApproval" component={WaitingApprovalScreen} />
        ) : status === "rejected" ? (
          <Stack.Group>
            <Stack.Screen name="Rejected" component={RejectedScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Approved" component={ApprovedScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Earnings" component={EarningsScreen} />
            <Stack.Screen name="Documents" component={DocumentsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
