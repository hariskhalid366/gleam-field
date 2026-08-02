import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Card, EmptyState, Input, Screen, ScreenHeader, Segmented } from "@/components";
import { CONVERSATIONS } from "@/data/jobs";
import type { TabScreenProps } from "@/navigation/types";

export default function MessagesScreen({ navigation }: TabScreenProps<"Messages">) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<"all" | "customer" | "admin">("all");
  const [query, setQuery] = useState("");

  const list = useMemo(
    () =>
      CONVERSATIONS.filter((c) => (tab === "all" ? true : c.role === tab)).filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [tab, query],
  );

  return (
    <Screen>
      <ScreenHeader title="Messages" subtitle="Customers and ServicePro support" />
      <Input placeholder="Search conversations" value={query} onChangeText={setQuery} />
      <Segmented
        options={[
          { label: "All", value: "all" as const },
          { label: "Customers", value: "customer" as const },
          { label: "Admin", value: "admin" as const },
        ]}
        value={tab}
        onChange={setTab}
      />

      {list.length ? (
        <Card padded={false}>
          {list.map((c) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              onPress={() => navigation.navigate("Chat", { conversationId: c.id })}
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={{ fontSize: 18 }}>{c.glyph}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.bodyStrong, { color: colors.text }]}>{c.name}</Text>
                <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
                  {c.last}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>{c.time}</Text>
                {c.unread ? (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={[typography.overline, { color: colors.textInverse, fontSize: 10 }]}>
                      {c.unread}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </Card>
      ) : (
        <EmptyState glyph="💬" title="No conversations" message="Messages from customers will show up here." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 44, height: 44, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
});
