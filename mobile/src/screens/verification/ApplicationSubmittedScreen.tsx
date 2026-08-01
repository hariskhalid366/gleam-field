import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Button, Card, Row, Screen } from "@/components";
import { useAuth } from "@/context/AuthContext";
import type { ScreenProps } from "@/navigation/types";

export default function ApplicationSubmittedScreen({ navigation }: ScreenProps<"ApplicationSubmitted">) {
  const { colors } = useTheme();
  const { technician } = useAuth();

  return (
    <Screen
      footer={<Button label="Track my application" onPress={() => navigation.replace("WaitingApproval")} />}
    >
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: colors.successSoft }]}>
          <Text style={{ fontSize: 48 }}>🎉</Text>
        </View>
        <Text style={[typography.display, { color: colors.text, textAlign: "center" }]}>
          Application submitted
        </Text>
        <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
          Thanks {technician?.name?.split(" ")[0] ?? "there"} — your application is now with the
          ServicePro verification team.
        </Text>
      </View>

      <Card title="What happens next">
        <Row label="1 · Document check" value="Within 24 hours" />
        <Row label="2 · Background verification" value="1–2 working days" />
        <Row label="3 · Approval decision" value="You'll be notified" />
      </Card>

      <Card title="Reference">
        <Row label="Application ID" value={technician?.id} />
        <Row label="Submitted" value={new Date(technician?.submittedAt ?? Date.now()).toLocaleString()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, paddingTop: spacing.xl },
  badge: {
    width: 120,
    height: 120,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
});
