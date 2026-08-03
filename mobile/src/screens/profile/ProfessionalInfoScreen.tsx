import React, { useState } from "react";
import { Alert } from "react-native";
import { spacing } from "@/theme";
import { Button, Card, Chip, ChipGroup, Input, Screen, ScreenHeader, Select } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { EXPERIENCE_LEVELS, SERVICE_CATEGORIES } from "@/data/constants";
import type { ScreenProps } from "@/navigation/types";

export default function ProfessionalInfoScreen({ navigation }: ScreenProps<"ProfessionalInfo">) {
  const { profile, updateProfile } = useAppData();
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [experience, setExperience] = useState(profile.experience);
  const [categories, setCategories] = useState<string[]>(profile.categories);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setCategories((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile({ headline, bio, experience, categories });
      setSaving(false);
      Alert.alert("Saved", "Your professional details have been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }, 600);
  };

  return (
    <Screen
      footer={
        <Button
          label="Save changes"
          loading={saving}
          disabled={!headline.trim() || categories.length === 0}
          onPress={save}
        />
      }
    >
      <ScreenHeader title="Professional details" subtitle="Skills, experience and services" onBack={() => navigation.goBack()} />

      <Card title="Headline & bio" style={{ gap: spacing.md }}>
        <Input label="Headline" required value={headline} onChangeText={setHeadline} />
        <Input label="About you" value={bio} onChangeText={setBio} multiline numberOfLines={5} />
      </Card>

      <Card title="Experience">
        <Select
          label="Years of experience"
          options={EXPERIENCE_LEVELS.map((e) => ({ label: e.label, value: e.value }))}
          value={experience}
          onChange={setExperience}
        />
      </Card>

      <Card title="Service categories" subtitle={`${categories.length} selected`}>
        <ChipGroup>
          {SERVICE_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={`${c.glyph} ${c.label}`}
              selected={categories.includes(c.id)}
              onPress={() => toggle(c.id)}
            />
          ))}
        </ChipGroup>
      </Card>
    </Screen>
  );
}
