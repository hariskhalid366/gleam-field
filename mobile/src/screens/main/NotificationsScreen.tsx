import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Button, Card, EmptyState, Screen, ScreenHeader, Segmented } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import type { AppNotification } from "@/data/jobs";
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
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } =
    useAppData();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const list = useMemo(
    () => notifications.filter((n) => (tab === "unread" ? n.unread : true)),
    [notifications, tab],
  );

  const open = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.kind === "job") navigation.navigate("Main", { screen: "Jobs" });
    else if (n.kind === "payment") navigation.navigate("Earnings");
    else if (n.kind === "approval") navigation.navigate("Documents");
  };

  return (
    <Screen
      footer={
        notifications.length ? (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              label="Mark all read"
              variant="secondary"
              fullWidth={false}
              style={{ flex: 1 }}
              disabled={!unreadCount}
              onPress={markAllNotificationsRead}
            />
            <Button label="Clear" variant="ghost" fullWidth={false} style={{ flex: 1 }} onPress={clearNotifications} />
          </View>
        ) : undefined
      }
    >
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <Segmented
        options={[
          { label: "All", value: "all" as const },
          { label: "Unread", value: "unread" as const, count: unreadCount },
        ]}
        value={tab}
        onChange={setTab}
      />

      {list.length ? (
        <Card padded={false}>
          {list.map((n) => (
            <Pressable
              key={n.id}
              accessibilityRole="button"
              onPress={() => open(n)}
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
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
            </Pressable>
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
