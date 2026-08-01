import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, shadows, spacing, typography } from "@/theme";

type Props = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
};

export function Card({ children, title, subtitle, right, padded = true, style }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: padded ? spacing.md : 0,
        },
        style,
      ]}
    >
      {(title || right) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={[typography.h3, { color: colors.text }]}>{title}</Text> : null}
            {subtitle ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
            ) : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, borderWidth: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerText: { flex: 1, gap: 2 },
});
