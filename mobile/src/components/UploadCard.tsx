import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { StatusChip } from "./StatusChip";

export type UploadValue = {
  name: string;
  size?: string;
  uploadedAt?: string;
  status?: "uploading" | "uploaded" | "rejected";
  note?: string;
};

type Props = {
  title: string;
  description: string;
  glyph?: string;
  required?: boolean;
  value?: UploadValue | null;
  onPick: () => void;
  onRemove?: () => void;
};

/** Dashed drop-zone upload card with uploading / uploaded / rejected states. */
export function UploadCard({
  title,
  description,
  glyph = "📄",
  required,
  value,
  onPick,
  onRemove,
}: Props) {
  const { colors } = useTheme();
  const uploading = value?.status === "uploading";
  const rejected = value?.status === "rejected";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Upload ${title}`}
      onPress={onPick}
      disabled={uploading}
      style={({ pressed }) => [
        styles.wrap,
        {
          borderColor: rejected ? colors.danger : value ? colors.primary : colors.border,
          backgroundColor: value && !rejected ? colors.primarySoft : colors.surface,
          borderStyle: value ? "solid" : "dashed",
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surfaceAlt }]}>
        {uploading ? <ActivityIndicator color={colors.primary} /> : <Text style={{ fontSize: 22 }}>{glyph}</Text>}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>
          {title}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
          {value ? `${value.name}${value.size ? ` · ${value.size}` : ""}` : description}
        </Text>
        {rejected && value?.note ? (
          <Text style={[typography.caption, { color: colors.danger }]}>{value.note}</Text>
        ) : null}
      </View>
      {value && !uploading ? (
        <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
          <StatusChip label={rejected ? "Rejected" : "Uploaded"} tone={rejected ? "danger" : "success"} />
          {onRemove ? (
            <Pressable onPress={onRemove} accessibilityRole="button" hitSlop={8}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Replace</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Text style={[typography.caption, { color: colors.primary, fontWeight: "700" }]}>
          {uploading ? "" : "Upload"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    minHeight: 88,
  },
  icon: { width: 48, height: 48, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
});
