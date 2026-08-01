import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, shadows, spacing, TOUCH_TARGET, typography } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "md" | "lg";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled,
  loading,
  fullWidth = true,
  left,
  right,
  style,
  accessibilityHint,
}: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.surface,
    ghost: "transparent",
    danger: colors.danger,
    success: colors.success,
  };
  const fg: Record<ButtonVariant, string> = {
    primary: colors.textInverse,
    secondary: colors.text,
    ghost: colors.primary,
    danger: colors.textInverse,
    success: colors.textInverse,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          borderColor: variant === "secondary" ? colors.border : "transparent",
          borderWidth: variant === "secondary" ? 1 : 0,
          minHeight: size === "lg" ? 52 : TOUCH_TARGET,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          paddingHorizontal: fullWidth ? spacing.lg : spacing.md,
          opacity: inactive ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !inactive ? 0.99 : 1 }],
        },
        variant === "primary" || variant === "danger" || variant === "success"
          ? shadows.card
          : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={styles.row}>
          {left ? <View style={styles.slot}>{left}</View> : null}
          <Text style={[typography.bodyStrong, { color: fg[variant] }]} numberOfLines={1}>
            {label}
          </Text>
          {right ? <View style={styles.slot}>{right}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm + 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  slot: { alignItems: "center", justifyContent: "center" },
});
