import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Banner, Button, OtpInput, Screen } from "@/components";
import type { ScreenProps } from "@/navigation/types";

const RESEND_SECONDS = 30;

export default function OtpVerificationScreen({ navigation, route }: ScreenProps<"OtpVerification">) {
  const { colors } = useTheme();
  const { destination, purpose } = route.params;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = async () => {
    setVerifying(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 600));
    setVerifying(false);
    // Demo rule: 000000 fails, anything else passes.
    if (code === "000000") {
      setError("That code isn't valid. Check the digits and try again.");
      return;
    }
    if (purpose === "reset") navigation.replace("ResetPassword", { token: code });
    else navigation.replace("ApplicationSubmitted");
  };

  return (
    <Screen
      footer={
        <Button label="Verify code" onPress={verify} disabled={code.length < 6} loading={verifying} />
      }
    >
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button">
        <Text style={[typography.h3, { color: colors.text }]}>‹ Back</Text>
      </Pressable>

      <View style={{ gap: spacing.xs, paddingTop: spacing.md }}>
        <Text style={[typography.display, { color: colors.text }]}>Verification code</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          We sent a 6-digit code to{" "}
          <Text style={{ color: colors.text, fontWeight: "700" }}>{destination}</Text>.
        </Text>
      </View>

      <OtpInput value={code} onChange={setCode} error={!!error} />

      {error ? <Banner tone="danger" glyph="⚠️" title="Invalid code" message={error} /> : null}

      <View style={{ alignItems: "center", paddingTop: spacing.sm }}>
        {seconds > 0 ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Resend code in {seconds}s
          </Text>
        ) : (
          <Pressable
            onPress={() => {
              setSeconds(RESEND_SECONDS);
              setCode("");
              setError(null);
            }}
            hitSlop={12}
            accessibilityRole="button"
          >
            <Text style={[typography.bodyStrong, { color: colors.primary }]}>Resend code</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
