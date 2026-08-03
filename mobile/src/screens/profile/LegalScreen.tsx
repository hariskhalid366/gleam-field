import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Card, Screen, ScreenHeader } from "@/components";
import type { ScreenProps } from "@/navigation/types";

const CONTENT: Record<"privacy" | "terms", { title: string; updated: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: "Privacy policy",
    updated: "Last updated 1 July 2026",
    sections: [
      { h: "What we collect", p: "Your identity documents, contact details, location while you are online, job photos and payout information." },
      { h: "How we use it", p: "To verify you, match you with nearby customers, process payouts and resolve disputes. We never sell your data." },
      { h: "Location", p: "Live location is shared with the customer only between accepting a job and completing it. Turning off location stops new requests." },
      { h: "Retention", p: "Verification documents are stored for as long as your account is active plus seven years for tax compliance." },
      { h: "Your rights", p: "You can export or delete your data from Profile → Delete account. Some records are retained where the law requires." },
    ],
  },
  terms: {
    title: "Terms of service",
    updated: "Last updated 1 July 2026",
    sections: [
      { h: "Eligibility", p: "You must be 18+, legally allowed to work, and pass ServicePro verification before receiving jobs." },
      { h: "Your obligations", p: "Arrive within the agreed window, quote transparently, use safe practice and treat customers respectfully." },
      { h: "Commission", p: "ServicePro deducts a 15% platform commission from the total job value including materials." },
      { h: "Cancellations", p: "Repeatedly declining or cancelling accepted jobs lowers your acceptance score and may suspend your account." },
      { h: "Suspension", p: "Accounts may be suspended for safety complaints, fraud, or expired documents. Blocked accounts cannot sign in." },
    ],
  },
};

export default function LegalScreen({ navigation, route }: ScreenProps<"Legal">) {
  const { colors } = useTheme();
  const doc = CONTENT[route.params.doc];

  return (
    <Screen>
      <ScreenHeader title={doc.title} subtitle={doc.updated} onBack={() => navigation.goBack()} />
      <Card>
        <View style={{ gap: spacing.md }}>
          {doc.sections.map((s) => (
            <View key={s.h} style={{ gap: 4 }}>
              <Text style={[typography.bodyStrong, { color: colors.text }]}>{s.h}</Text>
              <Text style={[typography.body, { color: colors.textMuted }]}>{s.p}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
