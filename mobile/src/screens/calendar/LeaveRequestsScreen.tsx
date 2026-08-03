import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Button, Card, EmptyState, Input, Screen, ScreenHeader, StatusChip } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import type { ScreenProps } from "@/navigation/types";

export default function LeaveRequestsScreen({ navigation }: ScreenProps<"LeaveRequests">) {
  const { colors } = useTheme();
  const { leaveRequests, requestLeave, cancelLeave } = useAppData();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  const submit = () => {
    requestLeave({ from, to: to || from, reason });
    setFrom("");
    setTo("");
    setReason("");
    Alert.alert("Leave requested", "Your dispatcher will review this shortly.");
  };

  return (
    <Screen
      footer={
        <Button
          label="Request leave"
          disabled={!from.trim() || reason.trim().length < 3}
          onPress={submit}
        />
      }
    >
      <ScreenHeader title="Leave requests" subtitle="Time off and unavailability" onBack={() => navigation.goBack()} />

      <Card title="New request" style={{ gap: spacing.md }}>
        <Input label="From" required placeholder="e.g. 22 Aug 2026" value={from} onChangeText={setFrom} />
        <Input label="To" placeholder="Leave empty for a single day" value={to} onChangeText={setTo} />
        <Input label="Reason" required value={reason} onChangeText={setReason} multiline numberOfLines={3} />
      </Card>

      <Card title="Your requests" subtitle={`${leaveRequests.length} on record`}>
        {leaveRequests.length ? (
          <View style={{ gap: spacing.sm }}>
            {leaveRequests.map((l) => (
              <View key={l.id} style={[styles.row, { borderColor: colors.border }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[typography.bodyStrong, { color: colors.text }]}>
                    {l.from}
                    {l.to !== l.from ? ` → ${l.to}` : ""}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{l.reason}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
                  <StatusChip
                    label={l.status === "approved" ? "Approved" : l.status === "pending" ? "Pending" : "Rejected"}
                    tone={l.status === "approved" ? "success" : l.status === "pending" ? "warning" : "danger"}
                  />
                  {l.status === "pending" ? (
                    <Button label="Cancel" variant="ghost" size="md" fullWidth={false} onPress={() => cancelLeave(l.id)} />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState glyph="🌴" title="No leave booked" message="Request time off and your calendar will block it out." />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});
