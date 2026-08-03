import React, { useState } from "react";
import { Alert } from "react-native";
import { spacing } from "@/theme";
import { Banner, Button, Card, Input, Screen, ScreenHeader } from "@/components";
import type { ScreenProps } from "@/navigation/types";

export default function ChangePasswordScreen({ navigation }: ScreenProps<"ChangePassword">) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== next;
  const valid = current.length >= 6 && next.length >= 8 && !mismatch && confirm.length > 0;

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert("Password changed", "Use your new password the next time you sign in.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 800);
  };

  return (
    <Screen footer={<Button label="Update password" loading={saving} disabled={!valid} onPress={save} />}>
      <ScreenHeader title="Change password" onBack={() => navigation.goBack()} />

      <Banner
        tone="info"
        glyph="🔑"
        title="Strong passwords only"
        message="At least 8 characters with a number and a symbol."
      />

      <Card style={{ gap: spacing.md }}>
        <Input label="Current password" required secureTextEntry value={current} onChangeText={setCurrent} />
        <Input
          label="New password"
          required
          secureTextEntry
          value={next}
          onChangeText={setNext}
          hint="Minimum 8 characters"
        />
        <Input
          label="Confirm new password"
          required
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          error={mismatch ? "Passwords do not match" : undefined}
        />
      </Card>
    </Screen>
  );
}
