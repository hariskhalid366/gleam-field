import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Banner, Button, Chip, ChipGroup, Input, Screen } from "@/components";
import type { ScreenProps } from "@/navigation/types";

export default function ForgotPasswordScreen({ navigation }: ScreenProps<"ForgotPassword">) {
  const { colors } = useTheme();
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const valid = method === "email" ? /\S+@\S+\.\S+/.test(value) : value.replace(/\D/g, "").length >= 10;

  const send = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    navigation.navigate("OtpVerification", { destination: value.trim(), purpose: "reset" });
  };

  return (
    <Screen
      footer={<Button label="Send verification code" onPress={send} disabled={!valid} loading={sending} />}
    >
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button">
        <Text style={[typography.h3, { color: colors.text }]}>‹ Back</Text>
      </Pressable>

      <View style={{ gap: spacing.xs, paddingTop: spacing.md }}>
        <Text style={[typography.display, { color: colors.text }]}>Forgot password?</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Pick where we should send your 6-digit verification code.
        </Text>
      </View>

      <ChipGroup>
        <Chip label="Email" selected={method === "email"} onPress={() => setMethod("email")} />
        <Chip label="SMS" selected={method === "sms"} onPress={() => setMethod("sms")} />
      </ChipGroup>

      <Input
        label={method === "email" ? "Email address" : "Mobile number"}
        required
        placeholder={method === "email" ? "you@example.com" : "+92 300 1234567"}
        keyboardType={method === "email" ? "email-address" : "phone-pad"}
        autoCapitalize="none"
        value={value}
        onChangeText={setValue}
      />

      <Banner
        tone="info"
        glyph="🔐"
        title="Codes expire in 10 minutes"
        message="You can request a new code every 30 seconds."
      />
    </Screen>
  );
}
