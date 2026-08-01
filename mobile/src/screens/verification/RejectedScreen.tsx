import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Banner, Button, Card, Screen, StatusChip, UploadCard } from "@/components";
import { useAuth } from "@/context/AuthContext";
import type { ScreenProps } from "@/navigation/types";
import type { RegistrationData } from "@/types/registration";

export default function RejectedScreen({ navigation }: ScreenProps<"Rejected">) {
  const { colors } = useTheme();
  const { technician, registration, updateRegistration, resubmitApplication, loading, logout } = useAuth();
  const rejection = technician?.rejection;

  const pick = (field: keyof RegistrationData, name: string) =>
    updateRegistration({ [field]: { name, size: "1.8 MB", status: "uploaded" } } as Partial<RegistrationData>);

  const reuploaded = !!registration.cnicFront && !!registration.selfie;

  return (
    <Screen
      footer={
        <>
          <Button
            label="Resubmit application"
            onPress={resubmitApplication}
            disabled={!reuploaded}
            loading={loading}
          />
          <Button label="Edit full application" variant="secondary" onPress={() => navigation.navigate("Registration")} />
          <Button label="Log out" variant="ghost" onPress={logout} />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: colors.dangerSoft }]}>
          <Text style={{ fontSize: 44 }}>⚠️</Text>
        </View>
        <StatusChip label="Rejected" tone="danger" />
        <Text style={[typography.h1, { color: colors.text, textAlign: "center" }]}>
          Your application needs changes
        </Text>
      </View>

      <Banner tone="danger" glyph="📝" title="Reason from the reviewer" message={rejection?.reason} />

      <Card title="Required corrections">
        {(rejection?.corrections ?? []).map((c, i) => (
          <Text key={i} style={[typography.body, { color: colors.text, paddingVertical: spacing.xs }]}>
            {i + 1}. {c}
          </Text>
        ))}
      </Card>

      <Card title="Re-upload documents" subtitle="Replace the rejected files, then resubmit.">
        <View style={{ gap: spacing.sm }}>
          <UploadCard title="CNIC — front" description="Sharp, full frame" glyph="🪪" required value={registration.cnicFront} onPick={() => pick("cnicFront", "cnic-front-v2.jpg")} />
          <UploadCard title="Live selfie" description="Daylight, no cap" glyph="🤳" required value={registration.selfie} onPick={() => pick("selfie", "selfie-v2.jpg")} />
          <UploadCard title="Trade licence" description="Valid 3+ months" glyph="📜" value={registration.tradeLicense} onPick={() => pick("tradeLicense", "licence-v2.pdf")} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, paddingTop: spacing.lg },
  badge: {
    width: 104,
    height: 104,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
});
