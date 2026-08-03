import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { BarChart, Button, Card, Row, Screen, ScreenHeader, Segmented, StatCard } from "@/components";
import { EARNINGS, fmtPKR } from "@/data/jobs";
import { useAppData } from "@/context/AppDataContext";
import type { ScreenProps } from "@/navigation/types";

export default function EarningsScreen({ navigation }: ScreenProps<"Earnings">) {
  const { colors } = useTheme();
  const { transactions, pendingPayout, withdraw } = useAppData();
  const [range, setRange] = useState<"today" | "week" | "month">("week");
  const total = EARNINGS[range];
  const commission = Math.round(total * EARNINGS.commissionRate);

  return (
    <Screen footer={<Button label={`Withdraw ${fmtPKR(pendingPayout)}`} disabled={pendingPayout <= 0} onPress={() => withdraw(pendingPayout)} />}>
      <ScreenHeader title="Earnings" subtitle="Payouts, commission and history" onBack={() => navigation.goBack()} />

      <Segmented
        options={[
          { label: "Today", value: "today" as const },
          { label: "This week", value: "week" as const },
          { label: "This month", value: "month" as const },
        ]}
        value={range}
        onChange={setRange}
      />

      <View style={styles.stats}>
        <StatCard label="Net earnings" value={fmtPKR(total - commission)} tone="primary" />
        <StatCard label="Pending payout" value={fmtPKR(pendingPayout)} tone="success" />
      </View>

      <Card title="This week" subtitle="Daily breakdown">
        <BarChart data={EARNINGS.weekly} />
      </Card>

      <Card title="Commission breakdown">
        <Row label="Gross earnings" value={fmtPKR(total)} />
        <Row label={`Platform commission (${EARNINGS.commissionRate * 100}%)`} value={fmtPKR(-commission)} />
        <Row label="Net payable" value={fmtPKR(total - commission)} />
      </Card>

      <Card title="Transactions">
        {transactions.map((t) => (
          <View key={t.id} style={[styles.tx, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.bodyStrong, { color: colors.text }]}>{t.label}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {t.ref} · {t.date}
              </Text>
            </View>
            <Text
              style={[
                typography.bodyStrong,
                { color: t.amount >= 0 ? colors.success : colors.textMuted },
              ]}
            >
              {fmtPKR(t.amount)}
            </Text>
          </View>
        ))}
      </Card>

      <Card title="Tax summary" subtitle="Financial year 2025–26">
        <Row label="Total earnings" value={fmtPKR(1284000)} />
        <Row label="Commission paid" value={fmtPKR(192600)} />
        <Row label="Withholding tax" value={fmtPKR(38520)} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: spacing.sm },
  tx: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
