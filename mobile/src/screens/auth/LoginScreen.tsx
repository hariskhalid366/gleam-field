import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Banner, Button, Input, Screen } from "@/components";
import type { ScreenProps } from "@/navigation/types";
import { useLoginController } from "./useLoginController";

export default function LoginScreen({ navigation }: ScreenProps<"Login">) {
  const { colors } = useTheme();
  const { values, functions } = useLoginController();

  return (
    <Screen
      footer={
        <>
          <Button label="Log in" onPress={functions.submit} disabled={!values.valid} loading={values.loading} />
          <Pressable onPress={() => navigation.navigate("Registration")} accessibilityRole="button">
            <Text style={[typography.caption, { color: colors.textMuted, textAlign: "center" }]}>
              New to ServicePro? <Text style={{ color: colors.primary, fontWeight: "700" }}>Apply as a technician</Text>
            </Text>
          </Pressable>
        </>
      }
    >
      <View style={{ gap: spacing.xs, paddingTop: spacing.lg }}>
        <Text style={[typography.display, { color: colors.text }]}>Welcome back</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Log in to pick up jobs and track your earnings.
        </Text>
      </View>

      {values.error ? <Banner tone="danger" glyph="⚠️" title="Couldn't log you in" message={values.error} /> : null}

      <Input
        label="Email address"
        required
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={values.email}
        onChangeText={functions.setEmail}
      />
      <Input
        label="Password"
        required
        placeholder="••••••••"
        secureTextEntry={values.secure}
        autoComplete="password"
        value={values.password}
        onChangeText={functions.setPassword}
        right={
          <Pressable onPress={functions.toggleSecure} hitSlop={10} accessibilityRole="button">
            <Text style={[typography.caption, { color: colors.primary }]}>{values.secure ? "Show" : "Hide"}</Text>
          </Pressable>
        }
      />

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Switch
            value={values.remember}
            onValueChange={functions.setRemember}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
          <Text style={[typography.caption, { color: colors.text }]}>Keep me signed in</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("ForgotPassword")} hitSlop={10} accessibilityRole="button">
          <Text style={[typography.caption, { color: colors.primary, fontWeight: "700" }]}>
            Forgot password?
          </Text>
        </Pressable>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
