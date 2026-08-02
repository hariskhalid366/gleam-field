import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Card, Chip, ListRow, Rating, Screen, ScreenHeader, StatusChip } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { PERFORMANCE } from "@/data/jobs";
import { SERVICE_CATEGORIES } from "@/data/constants";
import type { TabScreenProps } from "@/navigation/types";

export default function ProfileScreen({ navigation }: TabScreenProps<"Profile">) {
  const { colors } = useTheme();
  const { technician, status, logout } = useAuth();

  const confirmLogout = () =>
    Alert.alert("Log out", "You'll need to sign in again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);

  const confirmDelete = () =>
    Alert.alert("Delete account", "This permanently removes your technician account and history.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: logout },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Profile" subtitle="Your professional identity" />

      <Card>
        <View style={styles.head}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Text style={[typography.h1, { color: colors.primary }]}>
              {technician?.name?.charAt(0) ?? "T"}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[typography.h2, { color: colors.text }]}>{technician?.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{technician?.email}</Text>
            <Rating value={PERFORMANCE.rating} count={PERFORMANCE.reviews} />
          </View>
        </View>
        <StatusChip
          label={status === "suspended" ? "Suspended" : "Verified technician"}
          tone={status === "suspended" ? "danger" : "success"}
        />
      </Card>

      <Card title="Skills & categories">
        <View style={styles.chips}>
          {SERVICE_CATEGORIES.slice(0, 4).map((c) => (
            <Chip key={c.id} label={`${c.glyph} ${c.label}`} selected />
          ))}
        </View>
      </Card>

      <Card title="Account" padded={false} style={{ paddingHorizontal: spacing.md }}>
        <ListRow glyph="🧑" label="Personal information" description="Name, CNIC, date of birth" onPress={() => Alert.alert("Personal information", "Editable profile form.")} />
        <ListRow glyph="🛠" label="Professional details" description="Headline, bio, experience" onPress={() => Alert.alert("Professional details", "Editable profile form.")} />
        <ListRow glyph="📍" label="Working areas & radius" description="Karachi · 10 km" onPress={() => Alert.alert("Coverage", "Area and radius editor.")} />
        <ListRow glyph="🗣" label="Languages" description="Urdu, English" onPress={() => Alert.alert("Languages", "Language selector.")} />
        <ListRow glyph="🏦" label="Bank details" description="HBL ••••4421" onPress={() => Alert.alert("Bank details", "Payout account editor.")} />
        <ListRow glyph="📄" label="Documents" description="Verification status" onPress={() => navigation.navigate("Documents")} />
        <ListRow glyph="💳" label="Earnings & payouts" onPress={() => navigation.navigate("Earnings")} />
      </Card>

      <Card title="App" padded={false} style={{ paddingHorizontal: spacing.md }}>
        <ListRow glyph="⚙️" label="Settings" onPress={() => navigation.navigate("Settings")} />
        <ListRow glyph="🛟" label="Help & support" onPress={() => navigation.navigate("Chat", { conversationId: "c2" })} />
        <ListRow glyph="🔒" label="Privacy policy" onPress={() => Alert.alert("Privacy", "Opens the privacy policy.")} />
        <ListRow glyph="📃" label="Terms of service" onPress={() => Alert.alert("Terms", "Opens the terms of service.")} />
      </Card>

      <Card padded={false} style={{ paddingHorizontal: spacing.md }}>
        <ListRow glyph="🚪" label="Log out" onPress={confirmLogout} />
        <ListRow glyph="🗑" label="Delete account" danger onPress={confirmDelete} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 64, height: 64, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
