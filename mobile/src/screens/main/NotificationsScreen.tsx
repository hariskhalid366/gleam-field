import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Card, EmptyState, Screen, ScreenHeader, Segmented } from "@/components";
import { NOTIFICATIONS, type AppNotification } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

const GLYPH: Record<AppNotification["kind"], string> = {
  job: "🧰",
  approval: "🛡️",
  payment: "💳",
  promotion: "🎁",
  system: "⚙️",
};

export default function NotificationsScreen({ navigation }: ScreenProps<"Notifications">) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const list = useMemo(
    () => NOTIFICATIONS.filter((n) => (tab === "unread" ? n.unread : true)),
    [tab],
  );

  return (
    <Screen>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <Segmented
        options={[
          { label: "All", value: "all" as const },
          { label: "Unread", value: "unread" as const, count: NOTIFICATIONS.filter((n) => n.unread).length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {list.length ? (
        <Card padded={false}>
          {list.map((n) => (
            <View key={n.id} style={[styles.row, { borderBottomColor: colors.border }]}>
              <View
                style={[
                  styles.glyph,
                  { backgroundColor: n.unread ? colors.primarySoft : colors.surfaceAlt },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{GLYPH[n.kind]}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.bodyStrong, { color: colors.text }]}>{n.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>{n.body}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, fontSize: 11 }]}>{n.time}</Text>
              </View>
              {n.unread ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
            </View>
          ))}
        </Card>
      ) : (
        <EmptyState glyph="🔔" title="You're all caught up" message="New alerts will appear here." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm + 4,
    padding: spacing.md,
    alignItems: "flex-start",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  glyph: { width: 36, height: 36, borderRadius: radii.sm, alignItems: "center", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
