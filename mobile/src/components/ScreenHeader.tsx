import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { HIT_SLOP, radii, spacing, typography } from "@/theme";

/** Title bar for stack screens (headers are hidden globally). */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={HIT_SLOP}
          onPress={onBack}
          style={[styles.back, { backgroundColor: colors.surfaceAlt }]}
        >
          <Text style={{ color: colors.text, fontSize: 18 }}>‹</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.h2, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  back: { width: 36, height: 36, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
});
