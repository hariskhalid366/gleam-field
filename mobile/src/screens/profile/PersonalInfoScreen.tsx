import React, { useState } from "react";
import { Alert } from "react-native";
import { spacing } from "@/theme";
import { Button, Card, Input, Screen, ScreenHeader, Select } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { CITIES } from "@/data/constants";
import type { ScreenProps } from "@/navigation/types";

export default function PersonalInfoScreen({ navigation }: ScreenProps<"PersonalInfo">) {
  const { profile, updateProfile } = useAppData();
  const [form, setForm] = useState({
    fullName: profile.fullName,
    cnic: profile.cnic,
    dateOfBirth: profile.dateOfBirth,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    city: profile.city,
    emergency: { ...profile.emergency },
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.fullName.trim() && form.phone.trim() && form.email.trim();

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile(form);
      setSaving(false);
      Alert.alert("Saved", "Your personal information has been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 600);
  };

  return (
    <Screen footer={<Button label="Save changes" loading={saving} disabled={!valid} onPress={save} />}>
      <ScreenHeader title="Personal information" subtitle="Identity and contact" onBack={() => navigation.goBack()} />

      <Card title="Identity" style={{ gap: spacing.md }}>
        <Input label="Full name" required value={form.fullName} onChangeText={(v) => set("fullName", v)} />
        <Input label="CNIC" value={form.cnic} onChangeText={(v) => set("cnic", v)} keyboardType="numbers-and-punctuation" />
        <Input label="Date of birth" value={form.dateOfBirth} onChangeText={(v) => set("dateOfBirth", v)} />
      </Card>

      <Card title="Contact" style={{ gap: spacing.md }}>
        <Input label="Phone" required value={form.phone} onChangeText={(v) => set("phone", v)} keyboardType="phone-pad" />
        <Input label="Email" required value={form.email} onChangeText={(v) => set("email", v)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Home address" value={form.address} onChangeText={(v) => set("address", v)} multiline numberOfLines={3} />
        <Select
          label="City"
          options={CITIES.map((c) => ({ label: c, value: c }))}
          value={form.city}
          onChange={(v) => set("city", v)}
        />
      </Card>

      <Card title="Emergency contact" style={{ gap: spacing.md }}>
        <Input
          label="Name"
          value={form.emergency.name}
          onChangeText={(v) => setForm((f) => ({ ...f, emergency: { ...f.emergency, name: v } }))}
        />
        <Input
          label="Relationship"
          value={form.emergency.relation}
          onChangeText={(v) => setForm((f) => ({ ...f, emergency: { ...f.emergency, relation: v } }))}
        />
        <Input
          label="Phone"
          value={form.emergency.phone}
          keyboardType="phone-pad"
          onChangeText={(v) => setForm((f) => ({ ...f, emergency: { ...f.emergency, phone: v } }))}
        />
      </Card>
    </Screen>
  );
}
