import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, shadows, spacing, typography } from "@/theme";
import { StatusChip, type StatusTone } from "./StatusChip";
import { JOB_STATUS_LABEL, fmtPKR, type Job } from "@/data/jobs";

const TONE: Record<string, StatusTone> = {
  pending: "warning",
  assigned: "info",
  accepted: "info",
  travelling: "info",
  arrived: "info",
  in_progress: "warning",
  paused: "warning",
  completed: "success",
  verified: "success",
  cancelled: "danger",
};

export function JobCard({
  job,
  onPress,
  footer,
}: {
  job: Job;
  onPress?: () => void;
  footer?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${job.title}, ${JOB_STATUS_LABEL[job.status]}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.glyph, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={{ fontSize: 22 }}>{job.glyph}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={[typography.bodyStrong, { color: colors.text }]}>
            {job.title}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {job.reference} · {job.category}
          </Text>
        </View>
        <StatusChip label={JOB_STATUS_LABEL[job.status]} tone={TONE[job.status] ?? "neutral"} />
      </View>

      <View style={[styles.meta, { borderTopColor: colors.border }]}>
        <Meta glyph="🗓" text={`${job.scheduledFor} · ${job.window}`} />
        <Meta glyph="📍" text={`${job.customer.area} · ${job.distanceKm} km`} />
      </View>

      <View style={styles.bottom}>
        <Text style={[typography.h3, { color: colors.text }]}>{fmtPKR(job.price)}</Text>
        {job.urgent ? <StatusChip label="Urgent" tone="danger" /> : null}
      </View>
      {footer}
    </Pressable>
  );
}

function Meta({ glyph, text }: { glyph: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaRow}>
      <Text style={{ fontSize: 12 }}>{glyph}</Text>
      <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  glyph: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  meta: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
