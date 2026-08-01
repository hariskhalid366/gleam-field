import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import type { ScreenProps } from "@/navigation/types";

export default function SplashScreen({ navigation }: ScreenProps<"Splash">) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.86)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 520, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => navigation.replace("Onboarding"), 1600);
    return () => clearTimeout(t);
  }, [navigation, scale, fade]);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.primary }]}>
      <Animated.View style={{ transform: [{ scale }], opacity: fade, alignItems: "center", gap: spacing.md }}>
        <View style={styles.mark}>
          <Text style={{ fontSize: 40 }}>🛠️</Text>
        </View>
        <Text style={[typography.display, { color: "#FFFFFF" }]}>ServicePro</Text>
        <Text style={[typography.body, { color: "rgba(255,255,255,0.85)" }]}>Technician</Text>
      </Animated.View>
      <Text style={[typography.caption, styles.version, { color: "rgba(255,255,255,0.7)" }]}>
        v1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  mark: {
    width: 96,
    height: 96,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  version: { position: "absolute", bottom: spacing.xl },
});
