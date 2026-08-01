import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Banner, Button, Card, Screen, StatusChip } from "@/components";
import { useAuth } from "@/context/AuthContext";

const TIMELINE = [
  { key: "submitted", label: "Application received", done: true },
  { key: "documents", label: "Documents under review", done: true },
  { key: "background", label: "Background verification", done: false },
  { key: "decision", label: "Final approval", done: false },
];

export default function WaitingApprovalScreen() {
  const { colors } = useTheme();
  const { logout, simulateDecision } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      footer={<Button label="Log out" variant="secondary" onPress={logout} />}
    >
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: colors.warningSoft }]}>
          <Text style={{ fontSize: 44 }}>⏳</Text>
        </View>
        <StatusChip label="Waiting for approval" tone="warning" />
        <Text style={[typography.h1, { color: colors.text, textAlign: "center" }]}>
          We're reviewing your application
        </Text>
        <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
          You'll get a push notification the moment the business owner makes a decision. Most
          reviews finish within 48 hours.
        </Text>
      </View>

      <Card title="Verification progress">
        {TIMELINE.map((t, i) => (
          <View key={t.key} style={styles.step}>
            <View
              style={[
                styles.dot,
                { backgroundColor: t.done ? colors.success : colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Text style={{ fontSize: 12 }}>{t.done ? "✓" : i + 1}</Text>
            </View>
            <Text style={[typography.body, { color: t.done ? colors.text : colors.textMuted, flex: 1 }]}>
              {t.label}
            </Text>
          </View>
        ))}
      </Card>

      <Banner
        tone="info"
        glyph="📵"
        title="No job requests yet"
        message="Only approved technicians receive bookings. Nothing to do until then — pull down to refresh."
      />

      <Card title="Demo controls" subtitle="Simulate an admin decision">
        <View style={{ gap: spacing.sm }}>
          <Button label="Approve me" variant="success" onPress={() => simulateDecision("approved")} />
          <Button label="Reject me" variant="danger" onPress={() => simulateDecision("rejected")} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, paddingTop: spacing.lg },
  badge: {
    width: 104,
    height: 104,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  step: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
