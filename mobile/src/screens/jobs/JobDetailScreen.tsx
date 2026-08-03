import React, { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import {
  Banner,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Input,
  Rating,
  Row,
  Screen,
  ScreenHeader,
  StatusChip,
} from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { JOB_STATUS_LABEL, fmtPKR, type JobStatus } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

const NEXT_LABEL: Partial<Record<JobStatus, string>> = {
  assigned: "Accept assignment",
  accepted: "Start travelling",
  travelling: "I've arrived",
  arrived: "Start job",
  in_progress: "Complete job",
  paused: "Resume job",
  completed: "Mark verified",
};

const DECLINE_REASONS = ["Too far away", "Not available at that time", "Outside my skill set", "Price too low"];
const COUNTER_SLOTS = ["Today 6:00 PM – 7:30 PM", "Tomorrow 9:00 AM – 10:30 AM", "Tomorrow 4:00 PM – 6:00 PM"];

export default function JobDetailScreen({ navigation, route }: ScreenProps<"JobDetail">) {
  const { colors } = useTheme();
  const {
    jobById,
    acceptJob,
    declineJob,
    counterSchedule,
    advanceJob,
    pauseJob,
    resumeJob,
    addPhoto,
    setJobNotes,
    addMaterial,
    signJob,
  } = useAppData();
  const job = jobById(route.params.jobId);

  const [signed, setSigned] = useState(false);
  const [sheet, setSheet] = useState<"decline" | "counter" | "material" | null>(null);
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState("1");
  const [matCost, setMatCost] = useState("");

  if (!job) {
    return (
      <Screen>
        <ScreenHeader title="Job" onBack={() => navigation.goBack()} />
        <EmptyState glyph="🔍" title="Job not found" message="It may have been reassigned." />
      </Screen>
    );
  }

  const status = job.status;
  const active = ["accepted", "travelling", "arrived", "in_progress", "paused"].includes(status);
  const done = status === "completed" || status === "verified";

  const saveMaterial = () => {
    addMaterial(job.id, {
      name: matName.trim(),
      qty: Number(matQty) || 1,
      cost: Number(matCost) || 0,
    });
    setMatName("");
    setMatQty("1");
    setMatCost("");
    setSheet(null);
  };

  const footer =
    status === "pending" || status === "assigned" ? (
      <View style={{ gap: spacing.sm }}>
        <View style={styles.rowGap}>
          <Button label="Decline" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => setSheet("decline")} />
          <Button
            label="Accept job"
            fullWidth={false}
            style={{ flex: 1.4 }}
            onPress={() => {
              acceptJob(job.id);
              Alert.alert("Job accepted", "It's now in your active jobs.");
            }}
          />
        </View>
        <Button label="Propose another time" variant="ghost" onPress={() => setSheet("counter")} />
      </View>
    ) : active ? (
      <View style={{ gap: spacing.sm }}>
        <Button
          label={NEXT_LABEL[status] ?? "Continue"}
          variant={status === "in_progress" ? "success" : "primary"}
          onPress={() => (status === "paused" ? resumeJob(job.id) : advanceJob(job.id))}
        />
        {status === "in_progress" ? (
          <Button label="Pause job" variant="secondary" onPress={() => pauseJob(job.id)} />
        ) : null}
      </View>
    ) : done ? (
      <View style={{ gap: spacing.sm }}>
        <Button label="Generate invoice" onPress={() => navigation.navigate("Invoice", { jobId: job.id })} />
        {status === "completed" ? (
          <Button label="Mark verified" variant="secondary" onPress={() => advanceJob(job.id)} />
        ) : null}
      </View>
    ) : undefined;

  return (
    <Screen footer={footer}>
      <ScreenHeader
        title={job.reference}
        subtitle={job.category}
        onBack={() => navigation.goBack()}
        right={
          <StatusChip
            label={JOB_STATUS_LABEL[status]}
            tone={status === "cancelled" ? "danger" : done ? "success" : active ? "info" : "warning"}
          />
        }
      />

      <Card>
        <Text style={[typography.h3, { color: colors.text }]}>{job.title}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          {job.scheduledFor} · {job.window} · approx {job.durationMins} mins
        </Text>
        <Row label="Service fee" value={fmtPKR(job.price)} />
        <Row label="Distance" value={`${job.distanceKm} km`} />
        <Row label="Status" value={JOB_STATUS_LABEL[status]} />
      </Card>

      <Card title="Customer">
        <View style={styles.customer}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Text style={[typography.h3, { color: colors.primary }]}>{job.customer.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.bodyStrong, { color: colors.text }]}>{job.customer.name}</Text>
            <Rating value={job.customer.rating} />
          </View>
        </View>
        <Row label="Address" value={job.customer.address} />
        {job.customer.note ? (
          <Banner tone="info" glyph="📝" title="Customer note" message={job.customer.note} />
        ) : null}
        <View style={[styles.rowGap, { marginTop: spacing.sm }]}>
          <Button label="Call" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${job.customer.phone}`)} />
          <Button label="Chat" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => navigation.navigate("Chat", { conversationId: "c1" })} />
          <Button label="Navigate" fullWidth={false} style={{ flex: 1 }} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(job.customer.address)}`)} />
        </View>
      </Card>

      <Card title="Location" padded={false}>
        <View style={[styles.map, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={{ fontSize: 28 }}>🗺️</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {job.customer.area} · {job.distanceKm} km away
          </Text>
        </View>
      </Card>

      {active || done ? (
        <>
          <Card title="Job photos" subtitle="Before and after evidence">
            <View style={styles.rowGap}>
              <PhotoSlot label="Before" count={job.beforePhotos ?? 0} onAdd={() => addPhoto(job.id, "before")} />
              <PhotoSlot label="After" count={job.afterPhotos ?? 0} onAdd={() => addPhoto(job.id, "after")} />
            </View>
          </Card>

          <Card title="Work notes">
            <Input
              placeholder="What did you do on this job?"
              value={job.notes ?? ""}
              onChangeText={(v) => setJobNotes(job.id, v)}
              multiline
              numberOfLines={4}
            />
          </Card>

          <Card title="Materials used">
            {job.materials?.length ? (
              job.materials.map((m, i) => (
                <Row key={`${m.name}-${i}`} label={`${m.name} × ${m.qty}`} value={fmtPKR(m.cost * m.qty)} />
              ))
            ) : (
              <Text style={[typography.caption, { color: colors.textMuted }]}>No materials recorded.</Text>
            )}
            <Button label="Add material" variant="ghost" onPress={() => setSheet("material")} />
          </Card>

          <Card title="Customer signature">
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSigned(true);
                signJob(job.id);
              }}
              style={[styles.sign, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[typography.caption, { color: signed ? colors.success : colors.textMuted }]}>
                {signed ? `✓ Signed by ${job.customer.name}` : "Tap to capture signature"}
              </Text>
            </Pressable>
          </Card>
        </>
      ) : null}

      <BottomSheet visible={sheet === "decline"} onClose={() => setSheet(null)} title="Decline this job?">
        <View style={{ gap: spacing.sm }}>
          {DECLINE_REASONS.map((r) => (
            <Button
              key={r}
              label={r}
              variant="secondary"
              onPress={() => {
                setSheet(null);
                declineJob(job.id, r);
                navigation.navigate("Main", { screen: "Jobs" });
              }}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === "counter"} onClose={() => setSheet(null)} title="Propose another time">
        <View style={{ gap: spacing.sm }}>
          {COUNTER_SLOTS.map((s) => (
            <Button
              key={s}
              label={s}
              variant="secondary"
              onPress={() => {
                setSheet(null);
                counterSchedule(job.id, s.replace(/^(Today|Tomorrow) /, ""));
                Alert.alert("Sent", `${job.customer.name} will confirm the new slot.`);
              }}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === "material"} onClose={() => setSheet(null)} title="Add material">
        <View style={{ gap: spacing.md }}>
          <Input label="Material" required value={matName} onChangeText={setMatName} />
          <Input label="Quantity" value={matQty} onChangeText={setMatQty} keyboardType="number-pad" />
          <Input label="Unit cost (PKR)" value={matCost} onChangeText={setMatCost} keyboardType="number-pad" />
          <Button label="Save material" disabled={!matName.trim()} onPress={saveMaterial} />
        </View>
      </BottomSheet>
    </Screen>
  );
}

function PhotoSlot({ label, count, onAdd }: { label: string; count: number; onAdd: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Add ${label} photo`}
      onPress={onAdd}
      style={[styles.photo, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
    >
      <Text style={{ fontSize: 22 }}>📷</Text>
      <Text style={[typography.caption, { color: colors.text }]}>{label}</Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{count} uploaded</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowGap: { flexDirection: "row", gap: spacing.sm },
  customer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
  map: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radii.lg,
  },
  photo: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  sign: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
