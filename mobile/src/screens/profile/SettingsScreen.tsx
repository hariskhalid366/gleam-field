import React, { useState } from "react";
import { Alert, Switch } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { Card, ListRow, Screen, ScreenHeader } from "@/components";
import type { ScreenProps } from "@/navigation/types";

export default function SettingsScreen({ navigation }: ScreenProps<"Settings">) {
  const { colors, isDark, setMode } = useTheme();
  const [push, setPush] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [location, setLocation] = useState(true);

  const toggle = (value: boolean, onChange: (v: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: colors.primary, false: colors.border }}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <Card title="Notifications" padded={false} style={{ paddingHorizontal: 16 }}>
        <ListRow glyph="🔔" label="Push notifications" right={toggle(push, setPush)} />
        <ListRow glyph="🧰" label="New job alerts" right={toggle(jobAlerts, setJobAlerts)} />
      </Card>

      <Card title="Appearance" padded={false} style={{ paddingHorizontal: 16 }}>
        <ListRow
          glyph="🌙"
          label="Dark mode"
          right={toggle(isDark, (v) => setMode(v ? "dark" : "light"))}
        />
        <ListRow glyph="🌐" label="Language" description="English" onPress={() => Alert.alert("Language", "English · اردو")} />
      </Card>

      <Card title="Security" padded={false} style={{ paddingHorizontal: 16 }}>
        <ListRow glyph="🔑" label="Change password" onPress={() => navigation.navigate("ChangePassword")} />
        <ListRow glyph="🫆" label="Biometric login" right={toggle(biometrics, setBiometrics)} />
        <ListRow glyph="📍" label="Location permission" right={toggle(location, setLocation)} />
        <ListRow glyph="🛡" label="Privacy settings" onPress={() => navigation.navigate("Legal", { doc: "privacy" })} />
      </Card>

      <Card title="About" padded={false} style={{ paddingHorizontal: 16 }}>
        <ListRow glyph="ℹ️" label="App version" description="ServicePro Technician 1.0.0" />
        <ListRow glyph="📄" label="Open source licences" onPress={() => Alert.alert("Licences", "Third-party licences.")} />
      </Card>
    </Screen>
  );
}
