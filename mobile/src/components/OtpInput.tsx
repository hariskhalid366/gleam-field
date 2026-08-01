import React, { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";

export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const { colors } = useTheme();
  const refs = useRef<(TextInput | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, "");
    const chars = value.padEnd(length, " ").split("");
    if (clean.length > 1) {
      onChange(clean.slice(0, length));
      refs.current[Math.min(clean.length, length - 1)]?.focus();
      return;
    }
    chars[index] = clean || " ";
    onChange(chars.join("").replace(/ /g, "").slice(0, length));
    if (clean) refs.current[index + 1]?.focus();
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r;
            }}
            value={value[i] ?? ""}
            onChangeText={(t) => setDigit(i, t)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !value[i]) refs.current[i - 1]?.focus();
            }}
            keyboardType="number-pad"
            maxLength={length}
            accessibilityLabel={`Digit ${i + 1}`}
            style={[
              typography.h2,
              styles.box,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: error ? colors.danger : filled ? colors.primary : colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  box: {
    flex: 1,
    height: 60,
    textAlign: "center",
    borderWidth: 1.5,
    borderRadius: radii.md,
  },
});
