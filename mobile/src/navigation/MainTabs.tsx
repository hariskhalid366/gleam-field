import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme";
import type { MainTabParamList } from "./types";

import DashboardScreen from "@/screens/main/DashboardScreen";
import JobsScreen from "@/screens/jobs/JobsScreen";
import CalendarScreen from "@/screens/calendar/CalendarScreen";
import MessagesScreen from "@/screens/messages/MessagesScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const GLYPHS: Record<keyof MainTabParamList, string> = {
  Dashboard: "🏠",
  Jobs: "🧰",
  Calendar: "🗓",
  Messages: "💬",
  Profile: "👤",
};

export function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { ...typography.caption, fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{GLYPHS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarBadge: 2 }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
