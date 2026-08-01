import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import type { StatusTone } from "./StatusChip";

export function Banner({
  tone = "info",
  title,
  message,
  glyph,
}: {
  tone?: StatusTone;
  title: string;
  message?: string;
  glyph?: string;
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
    <View style={[styles.wrap, { backgroundColor: c.bg }]} accessibilityRole="alert">
      {glyph ? <Text style={{ fontSize: 18 }}>{glyph}</Text> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.bodyStrong, { color: c.fg }]}>{title}</Text>
        {message ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: "flex-start",
  },
});
