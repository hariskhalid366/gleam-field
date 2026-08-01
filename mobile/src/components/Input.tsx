import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function Input({
  label,
  hint,
  error,
  required,
  containerStyle,
  left,
  right,
  multiline,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: colors.surface,
            alignItems: multiline ? "flex-start" : "center",
            minHeight: multiline ? 112 : 52,
          },
        ]}
      >
        {left ? <View style={styles.slot}>{left}</View> : null}
        <TextInput
          {...rest}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textMuted}
          style={[
            typography.body,
            styles.input,
            { color: colors.text, textAlignVertical: multiline ? "top" : "center" },
          ]}
          accessibilityLabel={label ?? rest.placeholder}
        />
        {right ? <View style={styles.slot}>{right}</View> : null}
      </View>
      {error ? (
        <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: { flex: 1, padding: 0 },
  slot: { paddingTop: 2 },
});
