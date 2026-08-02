import React, { useState } from "react";
import { View } from "react-native";
import { spacing } from "@/theme";
import { Banner, Card, Screen, ScreenHeader, StatusChip, UploadCard, type UploadValue } from "@/components";
import { DOCUMENTS } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

const TONE: Record<string, "success" | "warning" | "neutral"> = {
  approved: "success",
  under_review: "warning",
  draft: "neutral",
};

const LABEL: Record<string, string> = {
  approved: "Approved",
  under_review: "Under review",
  draft: "Missing",
};

export default function DocumentsScreen({ navigation }: ScreenProps<"Documents">) {
  const [uploads, setUploads] = useState<Record<string, UploadValue | null>>({});

  const pick = (id: string, name: string) => {
    setUploads((u) => ({ ...u, [id]: { name, size: "1.8 MB", status: "uploading" } }));
    setTimeout(
      () =>
        setUploads((u) => ({
          ...u,
          [id]: { name, size: "1.8 MB", status: "uploaded", uploadedAt: new Date().toISOString() },
        })),
      900,
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Documents" subtitle="Verification files on record" onBack={() => navigation.goBack()} />
      <Banner
        tone="info"
        glyph="🛡️"
        title="Keep documents current"
        message="Expired documents pause your ability to receive jobs."
      />

      <View style={{ gap: spacing.md }}>
        {DOCUMENTS.map((d) => (
          <Card
            key={d.id}
            title={d.label}
            subtitle={`Updated ${d.updated}`}
            right={<StatusChip label={LABEL[d.status] ?? d.status} tone={TONE[d.status] ?? "neutral"} />}
          >
            <UploadCard
              title="Replace file"
              description="JPG or PDF, up to 5 MB"
              value={uploads[d.id] ?? null}
              onPick={() => pick(d.id, `${d.label}.jpg`)}
              onRemove={() => setUploads((u) => ({ ...u, [d.id]: null }))}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
