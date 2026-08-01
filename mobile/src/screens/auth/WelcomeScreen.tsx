import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Button, Card, Screen } from "@/components";
import type { ScreenProps } from "@/navigation/types";

const HIGHLIGHTS = [
  { glyph: "⚡", title: "Verified jobs only", body: "Every customer is screened before a job reaches you." },
  { glyph: "💰", title: "Weekly payouts", body: "Withdraw earnings straight to your bank account." },
  { glyph: "🛟", title: "24/7 support", body: "Real humans on the other end whenever a job goes sideways." },
];

export default function WelcomeScreen({ navigation }: ScreenProps<"Welcome">) {
  const { colors } = useTheme();

  return (
    <Screen
      footer={
        <>
          <Button label="Log in" onPress={() => navigation.navigate("Login")} />
          <Button
            label="Apply as a technician"
            variant="secondary"
            onPress={() => navigation.navigate("Registration")}
          />
          <Text style={[typography.caption, { color: colors.textMuted, textAlign: "center" }]}>
            By continuing you agree to the Terms of Service and Privacy Policy.
          </Text>
        </>
      }
    >
      <View style={styles.hero}>
        <View style={[styles.mark, { backgroundColor: colors.primary }]}>
          <Text style={{ fontSize: 34 }}>🛠️</Text>
        </View>
        <Text style={[typography.display, { color: colors.text }]}>Welcome to ServicePro</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          The app for verified field technicians. Get matched with nearby jobs, manage your
          schedule and track every rupee you earn.
        </Text>
      </View>

      {HIGHLIGHTS.map((h) => (
        <Card key={h.title}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ fontSize: 20 }}>{h.glyph}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.bodyStrong, { color: colors.text }]}>{h.title}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{h.body}</Text>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  mark: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
});
