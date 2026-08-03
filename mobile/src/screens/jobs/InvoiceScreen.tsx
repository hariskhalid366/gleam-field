import React, { useMemo } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Button, Card, EmptyState, Row, Screen, ScreenHeader } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { fmtPKR } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

export default function InvoiceScreen({ navigation, route }: ScreenProps<"Invoice">) {
  const { colors } = useTheme();
  const { jobById, invoices, generateInvoice, profile } = useAppData();
  const job = jobById(route.params.jobId);
  const invoice = useMemo(
    () => invoices[route.params.jobId] ?? generateInvoice(route.params.jobId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route.params.jobId],
  );

  if (!job || !invoice) {
    return (
      <Screen>
        <ScreenHeader title="Invoice" onBack={() => navigation.goBack()} />
        <EmptyState glyph="🧾" title="Invoice unavailable" message="Complete the job to generate an invoice." />
      </Screen>
    );
  }

  const share = async () => {
    try {
      await Share.share({
        message: `ServicePro invoice ${invoice.number} — ${job.title} — ${fmtPKR(invoice.total)}`,
      });
    } catch {
      Alert.alert("Share failed", "Try again in a moment.");
    }
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button label="Send to customer" onPress={() => Alert.alert("Invoice sent", `${invoice.number} emailed to ${job.customer.name}.`)} />
          <Button label="Share PDF" variant="secondary" onPress={share} />
        </View>
      }
    >
      <ScreenHeader title="Invoice" subtitle={invoice.number} onBack={() => navigation.goBack()} />

      <Card>
        <View style={[styles.head, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.h3, { color: colors.text }]}>ServicePro</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{profile.fullName}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{profile.phone}</Text>
          </View>
          <View style={[styles.stamp, { backgroundColor: colors.primarySoft }]}>
            <Text style={{ fontSize: 22 }}>🧾</Text>
          </View>
        </View>

        <Row label="Invoice number" value={invoice.number} />
        <Row label="Issued" value={invoice.issuedAt} />
        <Row label="Job reference" value={job.reference} />
        <Row label="Customer" value={job.customer.name} />
        <Row label="Address" value={job.customer.address} />
      </Card>

      <Card title="Line items">
        <Row label={`Labour — ${job.title}`} value={fmtPKR(invoice.labour)} />
        {(job.materials ?? []).map((m) => (
          <Row key={m.name} label={`${m.name} × ${m.qty}`} value={fmtPKR(m.cost * m.qty)} />
        ))}
        <Row label="Subtotal" value={fmtPKR(invoice.total)} />
        <Row label="Platform commission (15%)" value={fmtPKR(-invoice.commission)} />
      </Card>

      <Card>
        <View style={styles.total}>
          <Text style={[typography.bodyStrong, { color: colors.textMuted }]}>Customer pays</Text>
          <Text style={[typography.h2, { color: colors.text }]}>{fmtPKR(invoice.total)}</Text>
        </View>
        <View style={styles.total}>
          <Text style={[typography.bodyStrong, { color: colors.textMuted }]}>You receive</Text>
          <Text style={[typography.h3, { color: colors.success }]}>
            {fmtPKR(invoice.total - invoice.commission)}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stamp: { width: 48, height: 48, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  total: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.xs },
});
