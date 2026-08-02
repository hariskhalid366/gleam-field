import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Banner, Button, Card, Row, Screen, StatusChip } from "@/components";
import { useAuth } from "@/context/AuthContext";
import type { ScreenProps } from "@/navigation/types";

export default function ApprovedScreen({ navigation }: ScreenProps<"Approved">) {
  const { colors } = useTheme();
  const { technician, status } = useAuth();
  const suspended = status === "suspended";

  return (
    <Screen footer={<Button label="Go to dashboard" onPress={() => navigation.replace("Main")} />}>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: suspended ? colors.dangerSoft : colors.successSoft }]}>
          <Text style={{ fontSize: 48 }}>{suspended ? "⛔" : "🛡️"}</Text>
        </View>
        <StatusChip label={suspended ? "Suspended" : "Verified technician"} tone={suspended ? "danger" : "success"} />
        <Text style={[typography.display, { color: colors.text, textAlign: "center" }]}>
          {suspended ? "Account suspended" : "You're approved!"}
        </Text>
        <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
          {suspended
            ? "You can still view your account, but you won't receive new job requests until the suspension is lifted."
            : "Your verification is complete. Go online to start receiving job requests near you."}
        </Text>
      </View>

      <Card title="Account">
        <Row label="Technician" value={technician?.name} />
        <Row label="Email" value={technician?.email} />
        <Row label="Technician ID" value={technician?.id} />
      </Card>

      {suspended ? (
        <Banner tone="danger" glyph="📞" title="Need this lifted?" message="Contact support from Profile → Help & Support." />
      ) : (
        <Banner tone="info" glyph="🟢" title="Only online technicians get requests" message="Use the Online toggle on your dashboard to start and stop receiving jobs." />
      )}
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
