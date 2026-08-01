import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Button } from "@/components";
import { ONBOARDING_SLIDES } from "@/data/constants";
import type { ScreenProps } from "@/navigation/types";

const { width } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }: ScreenProps<"Onboarding">) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);
  const last = index === ONBOARDING_SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (last) return navigation.replace("Welcome");
    ref.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={() => navigation.replace("Welcome")} hitSlop={12} accessibilityRole="button">
          <Text style={[typography.bodyStrong, { color: colors.textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {ONBOARDING_SLIDES.map((s) => (
          <View key={s.title} style={[styles.slide, { width }]}>
            <View style={[styles.art, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ fontSize: 72 }}>{s.glyph}</Text>
            </View>
            <Text style={[typography.h1, { color: colors.text, textAlign: "center" }]}>{s.title}</Text>
            <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {ONBOARDING_SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              {
                width: i === index ? 24 : 8,
                backgroundColor: i === index ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={last ? "Get started" : "Next"} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  skipRow: { alignItems: "flex-end", padding: spacing.md },
  slide: { alignItems: "center", justifyContent: "center", gap: spacing.md, paddingHorizontal: spacing.lg },
  art: {
    width: 220,
    height: 220,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  dots: { flexDirection: "row", gap: spacing.sm, justifyContent: "center", paddingVertical: spacing.lg },
  dot: { height: 8, borderRadius: radii.pill },
  footer: { padding: spacing.md },
});
