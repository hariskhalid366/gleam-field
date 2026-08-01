import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";

export function ProgressBar({
  value,
  total,
  showLabel = true,
}: {
  value: number;
  total: number;
  showLabel?: boolean;
}) {
  const { colors } = useTheme();
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  return (
    <View style={{ gap: spacing.xs }}>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: value }}
        style={[styles.track, { backgroundColor: colors.surfaceAlt }]}
      >
        <View
          style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: colors.primary }]}
        />
      </View>
      {showLabel ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Step {value} of {total} · {Math.round(pct * 100)}% complete
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radii.pill, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill },
});
