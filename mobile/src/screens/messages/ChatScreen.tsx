import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { EmptyState, Screen, ScreenHeader } from "@/components";
import { CONVERSATIONS } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

type Msg = { id: string; from: "me" | "them"; text: string; time: string; kind?: string };

export default function ChatScreen({ navigation, route }: ScreenProps<"Chat">) {
  const { colors } = useTheme();
  const convo = useMemo(
    () => CONVERSATIONS.find((c) => c.id === route.params.conversationId),
    [route.params.conversationId],
  );
  const [messages, setMessages] = useState<Msg[]>(convo?.messages ?? []);
  const [draft, setDraft] = useState("");

  if (!convo) {
    return (
      <Screen>
        <ScreenHeader title="Chat" onBack={() => navigation.goBack()} />
        <EmptyState glyph="💬" title="Conversation not found" />
      </Screen>
    );
  }

  const send = (text: string, kind?: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { id: `m${m.length + 1}`, from: "me", text, kind, time: "now" },
    ]);
    setDraft("");
  };

  return (
    <Screen
      scroll={false}
      footer={
        <View style={{ gap: spacing.sm }}>
          <View style={styles.quickRow}>
            {[
              { glyph: "📷", label: "Photo", text: "Sent a photo" },
              { glyph: "📍", label: "Location", text: "Shared my live location" },
              { glyph: "🎤", label: "Voice", text: "Voice note (0:08)" },
              { glyph: "📎", label: "File", text: "Sent an attachment" },
            ].map((a) => (
              <Pressable
                key={a.label}
                accessibilityRole="button"
                accessibilityLabel={`Send ${a.label}`}
                onPress={() => send(a.text, a.label.toLowerCase())}
                style={[styles.quick, { backgroundColor: colors.surfaceAlt }]}
              >
                <Text style={{ fontSize: 16 }}>{a.glyph}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.composer}>
            <TextInput
              placeholder="Write a message"
              placeholderTextColor={colors.textMuted}
              value={draft}
              onChangeText={setDraft}
              style={[
                styles.input,
                { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={() => send(draft)}
              style={[styles.send, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.textInverse, fontSize: 16 }}>➤</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <ScreenHeader
        title={convo.name}
        subtitle={convo.role === "admin" ? "ServicePro support" : "Customer"}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}>
        {messages.map((m) => {
          const mine = m.from === "me";
          return (
            <View
              key={m.id}
              style={[
                styles.bubble,
                {
                  alignSelf: mine ? "flex-end" : "flex-start",
                  backgroundColor: mine ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderWidth: mine ? 0 : 1,
                },
              ]}
            >
              <Text style={[typography.body, { color: mine ? colors.textInverse : colors.text }]}>
                {m.kind === "location" ? "📍 " : m.kind === "image" ? "🖼 " : m.kind === "voice" ? "🎤 " : ""}
                {m.text}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: mine ? "rgba(255,255,255,0.75)" : colors.textMuted, fontSize: 11 },
                ]}
              >
                {m.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "82%", padding: spacing.sm + 4, borderRadius: radii.lg, gap: 2 },
  composer: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  input: { flex: 1, minHeight: 48, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: spacing.md },
  send: { width: 48, height: 48, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  quickRow: { flexDirection: "row", gap: spacing.sm },
  quick: { width: 44, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
});
