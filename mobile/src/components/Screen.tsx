import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme";
import { Banner } from "./Banner";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  footer?: React.ReactNode;
  padded?: boolean;
  edges?: Edge[];
  offline?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
};

/** App-wide page shell: safe areas, keyboard avoidance, offline banner, sticky footer. */
export function Screen({
  children,
  scroll = true,
  footer,
  padded = true,
  edges = ["top", "bottom"],
  offline,
  refreshing,
  onRefresh,
  contentStyle,
}: Props) {
  const { colors } = useTheme();
  const pad = padded ? spacing.md : 0;

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined
      }
      contentContainerStyle={[{ padding: pad, gap: spacing.md, paddingBottom: spacing.xl }, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: pad, gap: spacing.md }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {offline ? (
          <View style={{ paddingHorizontal: pad, paddingTop: spacing.sm }}>
            <Banner
              tone="warning"
              glyph="📶"
              title="You're offline"
              message="Changes are saved on this device and will sync automatically."
            />
          </View>
        ) : null}
        {body}
        {footer ? (
          <View
            style={[
              styles.footer,
              { backgroundColor: colors.surface, borderTopColor: colors.border },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { padding: spacing.md, borderTopWidth: 1, gap: spacing.sm },
});
