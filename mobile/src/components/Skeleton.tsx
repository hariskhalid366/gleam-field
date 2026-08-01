import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme";

export function Skeleton({
  height = 16,
  width = "100%",
  radius = radii.sm,
  style,
}: {
  height?: number;
  width?: ViewStyle["width"];
  radius?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        { height, width, borderRadius: radius, backgroundColor: colors.surfaceAlt, opacity: anim },
        style,
      ]}
    />
  );
}

/** Generic list loading state built from skeleton rows. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton height={48} width={48} radius={radii.md} />
          <View style={styles.rowText}>
            <Skeleton height={14} width="70%" />
            <Skeleton height={12} width="45%" />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  rowText: { flex: 1, gap: spacing.sm },
});
