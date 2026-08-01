import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { ProgressBar } from "./ProgressBar";

export function StepHeader({
  step,
  total,
  title,
  subtitle,
  onBack,
  onExit,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onExit?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={[typography.h3, { color: colors.text }]}>‹ Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {onExit ? (
          <Pressable onPress={onExit} hitSlop={12} accessibilityRole="button" accessibilityLabel="Save and exit">
            <Text style={[typography.caption, { color: colors.textMuted }]}>Save & exit</Text>
          </Pressable>
        ) : null}
      </View>
      <ProgressBar value={step} total={total} />
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.h1, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 32 },
});
