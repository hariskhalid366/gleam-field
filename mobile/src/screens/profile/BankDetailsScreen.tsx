import React, { useState } from "react";
import { Alert } from "react-native";
import { spacing } from "@/theme";
import { Banner, Button, Card, Input, Screen, ScreenHeader, Select } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { BANKS } from "@/data/constants";
import type { ScreenProps } from "@/navigation/types";

export default function BankDetailsScreen({ navigation }: ScreenProps<"BankDetails">) {
  const { profile, updateProfile } = useAppData();
  const [bank, setBank] = useState({ ...profile.bank });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof bank, v: string) => setBank((b) => ({ ...b, [k]: v }));
  const valid = bank.bankName && bank.accountTitle.trim() && bank.accountNumber.trim().length >= 8;

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile({ bank });
      setSaving(false);
      Alert.alert("Payout account updated", "Future payouts will go to this account.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 700);
  };

  return (
    <Screen footer={<Button label="Save bank details" loading={saving} disabled={!valid} onPress={save} />}>
      <ScreenHeader title="Bank details" subtitle="Where your payouts land" onBack={() => navigation.goBack()} />

      <Banner
        tone="info"
        glyph="🔒"
        title="Your details are encrypted"
        message="Account changes are reviewed before the next payout run."
      />

      <Card style={{ gap: spacing.md }}>
        <Select
          label="Bank"
          required
          options={BANKS.map((b) => ({ label: b, value: b }))}
          value={bank.bankName}
          onChange={(v) => set("bankName", v)}
        />
        <Input label="Account title" required value={bank.accountTitle} onChangeText={(v) => set("accountTitle", v)} />
        <Input
          label="Account number"
          required
          value={bank.accountNumber}
          onChangeText={(v) => set("accountNumber", v)}
          keyboardType="number-pad"
        />
        <Input label="IBAN" value={bank.iban} onChangeText={(v) => set("iban", v)} autoCapitalize="characters" />
      </Card>
    </Screen>
  );
}
