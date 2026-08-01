import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Banner, Button, Input, Screen } from "@/components";
import { useAuth } from "@/context/AuthContext";
import type { ScreenProps } from "@/navigation/types";

export default function LoginScreen({ navigation }: ScreenProps<"Login">) {
  const { colors } = useTheme();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;

  const onSubmit = async () => {
    setError(null);
    try {
      await login(email.trim(), password);
      // RootNavigator swaps the stack as soon as status changes.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button label="Log in" onPress={onSubmit} disabled={!valid} loading={loading} />
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

      {error ? <Banner tone="danger" glyph="⚠️" title="Couldn't log you in" message={error} /> : null}

      <Input
        label="Email address"
        required
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        required
        placeholder="••••••••"
        secureTextEntry={secure}
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        right={
          <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10} accessibilityRole="button">
            <Text style={[typography.caption, { color: colors.primary }]}>{secure ? "Show" : "Hide"}</Text>
          </Pressable>
        }
      />

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Switch
            value={remember}
            onValueChange={setRemember}
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

      <Banner
        tone="info"
        glyph="💡"
        title="Demo accounts"
        message="pending@demo.com → waiting screen · rejected@demo.com → rejection screen · blocked@demo.com → login blocked · anything else → approved. Password: any 6+ characters."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
