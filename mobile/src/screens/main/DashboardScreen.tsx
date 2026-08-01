import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Banner, Button, Card, EmptyState, Rating, Screen, StatusChip } from "@/components";
import { useAuth } from "@/context/AuthContext";

/**
 * Placeholder dashboard — the next pass builds the full main app
 * (Dashboard, Jobs, Calendar, Messages, Profile with bottom tabs).
 */
export default function DashboardScreen() {
  const { colors } = useTheme();
  const { technician, status, logout } = useAuth();
  const suspended = status === "suspended";
  const [online, setOnline] = useState(false);

  return (
    <Screen footer={<Button label="Log out" variant="secondary" onPress={logout} />}>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Welcome back</Text>
            <Text style={[typography.h2, { color: colors.text }]}>{technician?.name}</Text>
            <Rating value={4.8} count={126} />
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <StatusChip label={suspended ? "Suspended" : online ? "Online" : "Offline"} tone={suspended ? "danger" : online ? "success" : "neutral"} />
            <Switch
              value={online && !suspended}
              disabled={suspended}
              onValueChange={setOnline}
              trackColor={{ true: colors.success, false: colors.border }}
            />
          </View>
        </View>
      </Card>

      {suspended ? (
        <Banner tone="danger" glyph="⛔" title="You can't go online" message="Suspended technicians don't receive job requests." />
      ) : null}

      <View style={styles.stats}>
        {[
          { label: "Today", value: "PKR 0" },
          { label: "This week", value: "PKR 0" },
          { label: "This month", value: "PKR 0" },
        ].map((s) => (
          <Card key={s.label} style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{s.label}</Text>
            <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
          </Card>
        ))}
      </View>

      <Card title="Today's jobs">
        <EmptyState
          glyph="📭"
          title="No jobs yet"
          message={online ? "You're online — new requests will appear here." : "Go online to start receiving job requests."}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stats: { flexDirection: "row", gap: spacing.sm },
});
