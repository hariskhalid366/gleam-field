import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export const APPLICATION_STATUS_TONE: Record<string, StatusTone> = {
  draft: "neutral",
  submitted: "info",
  pending: "warning",
  under_review: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "danger",
  blocked: "danger",
};

export function StatusChip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: StatusTone;
}) {
  const { colors } = useTheme();
  const map: Record<StatusTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    info: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  };
  const c = map[tone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[typography.overline, { color: c.fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
