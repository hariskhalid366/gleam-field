import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, shadows, spacing, typography } from "@/theme";

export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, shadows.raised, { backgroundColor: colors.surface }]}>
        <View style={[styles.grabber, { backgroundColor: colors.border }]} />
        {title ? <Text style={[typography.h3, { color: colors.text }]}>{title}</Text> : null}
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: spacing.md }}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

export type Option = { label: string; value: string };

export function Select({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <Text style={[typography.body, { color: selected ? colors.text : colors.textMuted, flex: 1 }]}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={{ color: colors.textMuted }}>▾</Text>
      </Pressable>

      <BottomSheet visible={open} title={label} onClose={() => setOpen(false)}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={[styles.option, { borderBottomColor: colors.border }]}
            >
              <Text style={[typography.body, { color: active ? colors.primary : colors.text, flex: 1 }]}>
                {o.label}
              </Text>
              {active ? <Text style={{ color: colors.primary }}>✓</Text> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    gap: spacing.sm,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: spacing.sm },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
