import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, shadows, spacing, typography } from "@/theme";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  onPress,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "success";
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const bg =
    tone === "primary" ? colors.primarySoft : tone === "success" ? colors.successSoft : colors.surface;
  const fg = tone === "primary" ? colors.primary : tone === "success" ? colors.success : colors.text;
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        { backgroundColor: bg, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.h2, { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text> : null}
    </Pressable>
  );
}

/** Horizontal progress metric used for performance and rates. */
export function MetricBar({ label, value, suffix = "%" }: { label: string; value: number; suffix?: string }) {
  const { colors } = useTheme();
  const tone = value >= 90 ? colors.success : value >= 75 ? colors.warning : colors.danger;
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.metricTop}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>
          {value}
          {suffix}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.fill, { width: `${Math.min(100, value)}%`, backgroundColor: tone }]} />
      </View>
    </View>
  );
}

/** Lightweight bar chart — no chart dependency needed. */
export function BarChart({ data }: { data: { day: string; amount: number }[] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <View style={styles.chart}>
      {data.map((d) => (
        <View key={d.day} style={styles.chartCol}>
          <View style={[styles.chartTrack, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.chartBar,
                { height: `${Math.max(4, (d.amount / max) * 100)}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radii.lg, borderWidth: 1, padding: spacing.md, gap: 2 },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  track: { height: 8, borderRadius: radii.pill, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.pill },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, height: 150 },
  chartCol: { flex: 1, alignItems: "center", gap: spacing.xs, height: "100%" },
  chartTrack: { flex: 1, width: "100%", borderRadius: radii.sm, justifyContent: "flex-end", overflow: "hidden" },
  chartBar: { width: "100%", borderRadius: radii.sm },
});
