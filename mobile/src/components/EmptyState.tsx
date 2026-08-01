import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Button } from "./Button";

export function EmptyState({
  glyph = "📭",
  title,
  message,
  actionLabel,
  onAction,
}: {
  glyph?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.glyph, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={{ fontSize: 32 }}>{glyph}</Text>
      </View>
      <Text style={[typography.h3, { color: colors.text, textAlign: "center" }]}>{title}</Text>
      {message ? (
        <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl },
  glyph: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
});
