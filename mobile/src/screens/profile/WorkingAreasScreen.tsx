import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme";
import { Button, Card, Chip, ChipGroup, Screen, ScreenHeader, Select } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { AREAS_BY_CITY, CITIES, LANGUAGES, RADIUS_OPTIONS } from "@/data/constants";
import type { ScreenProps } from "@/navigation/types";

export default function WorkingAreasScreen({ navigation }: ScreenProps<"WorkingAreas">) {
  const { colors } = useTheme();
  const { profile, updateProfile } = useAppData();
  const [city, setCity] = useState(profile.city);
  const [areas, setAreas] = useState<string[]>(profile.areas);
  const [radiusKm, setRadiusKm] = useState(profile.radiusKm);
  const [languages, setLanguages] = useState<string[]>(profile.languages);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const save = () => {
    updateProfile({ city, areas, radiusKm, languages });
    Alert.alert("Coverage updated", `You'll receive jobs within ${radiusKm} km of ${city}.`, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen footer={<Button label="Save coverage" disabled={!areas.length} onPress={save} />}>
      <ScreenHeader title="Working areas" subtitle="Where you take jobs" onBack={() => navigation.goBack()} />

      <Card title="City">
        <Select
          label="Base city"
          options={CITIES.map((c) => ({ label: c, value: c }))}
          value={city}
          onChange={(v) => {
            setCity(v);
            setAreas([]);
          }}
        />
      </Card>

      <Card title="Areas" subtitle={`${areas.length} selected`}>
        <ChipGroup>
          {(AREAS_BY_CITY[city] ?? []).map((a) => (
            <Chip key={a} label={a} selected={areas.includes(a)} onPress={() => toggle(areas, setAreas, a)} />
          ))}
        </ChipGroup>
      </Card>

      <Card title="Working radius" subtitle={`${radiusKm} km around your base`}>
        <View style={{ gap: spacing.sm }}>
          <ChipGroup>
            {RADIUS_OPTIONS.map((r) => (
              <Chip key={r} label={`${r} km`} selected={r === radiusKm} onPress={() => setRadiusKm(r)} />
            ))}
          </ChipGroup>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            A wider radius means more requests but longer travel time.
          </Text>
        </View>
      </Card>

      <Card title="Languages">
        <ChipGroup>
          {LANGUAGES.map((l) => (
            <Chip
              key={l}
              label={l}
              selected={languages.includes(l)}
              onPress={() => toggle(languages, setLanguages, l)}
            />
          ))}
        </ChipGroup>
      </Card>
    </Screen>
  );
}
