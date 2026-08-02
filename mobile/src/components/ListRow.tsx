import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, TOUCH_TARGET, typography } from "@/theme";

/** Tappable settings/profile row with a leading glyph and optional right slot. */
export function ListRow({
  glyph,
  label,
  description,
  right,
  onPress,
  danger,
}: {
  glyph?: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {glyph ? (
        <View style={[styles.glyph, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={{ fontSize: 16 }}>{glyph}</Text>
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.bodyStrong, { color: danger ? colors.danger : colors.text }]}>
          {label}
        </Text>
        {description ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{description}</Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Text style={{ color: colors.textMuted }}>›</Text> : null)}
    </Pressable>
  );
}

/** Pill segmented control for tab-like filters. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, active && { backgroundColor: colors.surface }]}
          >
            <Text
              numberOfLines={1}
              style={[
                typography.caption,
                { color: active ? colors.text : colors.textMuted, fontWeight: active ? "700" : "400" },
              ]}
            >
              {o.label}
              {o.count != null ? ` (${o.count})` : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    minHeight: TOUCH_TARGET,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  glyph: { width: 36, height: 36, borderRadius: radii.sm, alignItems: "center", justifyContent: "center" },
  segment: { flexDirection: "row", padding: 4, borderRadius: radii.pill, gap: 4 },
  segmentItem: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
});
