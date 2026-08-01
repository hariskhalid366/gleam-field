import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Banner, Button, Input, Screen } from "@/components";
import type { ScreenProps } from "@/navigation/types";

function rules(pw: string) {
  return [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
    { label: "One number", ok: /\d/.test(pw) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}

export default function ResetPasswordScreen({ navigation }: ScreenProps<"ResetPassword">) {
  const { colors } = useTheme();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const checks = rules(password);
  const strong = checks.every((c) => c.ok);
  const matches = password.length > 0 && password === confirm;

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <Screen footer={<Button label="Back to login" onPress={() => navigation.replace("Login")} />}>
        <View style={styles.success}>
          <View style={[styles.badge, { backgroundColor: colors.successSoft }]}>
            <Text style={{ fontSize: 44 }}>✅</Text>
          </View>
          <Text style={[typography.h1, { color: colors.text, textAlign: "center" }]}>
            Password updated
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
            Your password has been changed. All other devices were signed out for your security.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button label="Save new password" onPress={save} disabled={!strong || !matches} loading={saving} />
      }
    >
      <View style={{ gap: spacing.xs, paddingTop: spacing.lg }}>
        <Text style={[typography.display, { color: colors.text }]}>Set a new password</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Choose a strong password you haven't used before.
        </Text>
      </View>

      <Input
        label="New password"
        required
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
      />
      <Input
        label="Confirm password"
        required
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••••"
        error={confirm.length > 0 && !matches ? "Passwords don't match" : undefined}
      />

      <View style={{ gap: spacing.xs }}>
        {checks.map((c) => (
          <Text
            key={c.label}
            style={[typography.caption, { color: c.ok ? colors.success : colors.textMuted }]}
          >
            {c.ok ? "✓" : "•"} {c.label}
          </Text>
        ))}
      </View>

      <Banner
        tone="warning"
        glyph="🔒"
        title="You'll be signed out everywhere"
        message="Changing your password ends every other active session."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: { alignItems: "center", gap: spacing.sm, paddingTop: spacing.xxl },
  badge: {
    width: 112,
    height: 112,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
});
