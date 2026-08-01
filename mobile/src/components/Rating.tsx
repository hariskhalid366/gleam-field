import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";

export function Rating({ value, count }: { value: number; count?: number }) {
  const { colors } = useTheme();
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row} accessibilityLabel={`Rated ${value} out of 5`}>
      {stars.map((s) => (
        <Text key={s} style={{ color: s <= Math.round(value) ? colors.warning : colors.border }}>
          ★
        </Text>
      ))}
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {value.toFixed(1)}
        {count != null ? ` (${count})` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
});
