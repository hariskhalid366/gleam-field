import React, { useState } from "react";
import { Alert, Linking, View } from "react-native";
import { spacing } from "@/theme";
import { Button, Card, Input, ListRow, Screen, ScreenHeader, Select } from "@/components";
import type { ScreenProps } from "@/navigation/types";

const FAQS = [
  { q: "When do payouts arrive?", a: "Withdrawals are processed every business day and settle in 1–2 working days." },
  { q: "Why am I not receiving jobs?", a: "Check that you're online, not on vacation mode, and that your documents are approved." },
  { q: "How is commission calculated?", a: "ServicePro deducts 15% of the job value including materials." },
  { q: "Can I change my service areas?", a: "Yes — Profile → Working areas & radius. Changes apply immediately." },
];

const TOPICS = [
  { label: "Payments & payouts", value: "payments" },
  { label: "Jobs & scheduling", value: "jobs" },
  { label: "Account & verification", value: "account" },
  { label: "App problem", value: "bug" },
];

export default function HelpSupportScreen({ navigation }: ScreenProps<"HelpSupport">) {
  const [topic, setTopic] = useState("payments");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessage("");
      Alert.alert("Ticket created", "Support will reply in your Messages inbox within 24 hours.", [
        { text: "Open messages", onPress: () => navigation.navigate("Chat", { conversationId: "c2" }) },
        { text: "OK" },
      ]);
    }, 800);
  };

  return (
    <Screen
      footer={<Button label="Submit ticket" loading={sending} disabled={message.trim().length < 10} onPress={submit} />}
    >
      <ScreenHeader title="Help & support" subtitle="We're here around the clock" onBack={() => navigation.goBack()} />

      <Card title="Contact us" padded={false} style={{ paddingHorizontal: spacing.md }}>
        <ListRow glyph="💬" label="Chat with support" description="Typical reply in 10 minutes" onPress={() => navigation.navigate("Chat", { conversationId: "c2" })} />
        <ListRow glyph="📞" label="Call helpline" description="+92 21 111 555 777" onPress={() => Linking.openURL("tel:+922111555777")} />
        <ListRow glyph="✉️" label="Email" description="support@servicepro.pk" onPress={() => Linking.openURL("mailto:support@servicepro.pk")} />
      </Card>

      <Card title="Frequently asked" padded={false} style={{ paddingHorizontal: spacing.md }}>
        {FAQS.map((f) => (
          <ListRow
            key={f.q}
            glyph="❓"
            label={f.q}
            description={open === f.q ? f.a : undefined}
            onPress={() => setOpen((o) => (o === f.q ? null : f.q))}
          />
        ))}
      </Card>

      <Card title="Raise a ticket">
        <View style={{ gap: spacing.md }}>
          <Select label="Topic" options={TOPICS} value={topic} onChange={setTopic} />
          <Input
            label="Describe the issue"
            placeholder="Tell us what happened…"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
          />
        </View>
      </Card>
    </Screen>
  );
}
