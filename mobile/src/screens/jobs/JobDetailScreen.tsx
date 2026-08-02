import React, { useMemo, useState } from "react";
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
import { JOBS, JOB_FLOW, JOB_STATUS_LABEL, fmtPKR, type JobStatus } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

const NEXT_LABEL: Partial<Record<JobStatus, string>> = {
  accepted: "Start travelling",
  travelling: "I've arrived",
  arrived: "Start job",
  in_progress: "Complete job",
  paused: "Resume job",
  completed: "Awaiting customer verification",
};

export default function JobDetailScreen({ navigation, route }: ScreenProps<"JobDetail">) {
  const { colors } = useTheme();
  const job = useMemo(() => JOBS.find((j) => j.id === route.params.jobId), [route.params.jobId]);

  const [status, setStatus] = useState<JobStatus>(job?.status ?? "pending");
  const [notes, setNotes] = useState(job?.notes ?? "");
  const [before, setBefore] = useState(job?.beforePhotos ?? 0);
  const [after, setAfter] = useState(job?.afterPhotos ?? 0);
  const [signed, setSigned] = useState(false);
  const [sheet, setSheet] = useState(false);

  if (!job) {
    return (
      <Screen>
        <ScreenHeader title="Job" onBack={() => navigation.goBack()} />
        <EmptyState glyph="🔍" title="Job not found" message="It may have been reassigned." />
      </Screen>
    );
  }

  const advance = () => {
    if (status === "paused") return setStatus("in_progress");
    const i = JOB_FLOW.indexOf(status);
    const next = JOB_FLOW[i + 1];
    if (next) setStatus(next);
  };

  const active = ["accepted", "travelling", "arrived", "in_progress", "paused"].includes(status);
  const done = status === "completed" || status === "verified";

  const footer =
    status === "pending" ? (
      <View style={styles.rowGap}>
        <Button label="Reject" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => setSheet(true)} />
        <Button label="Accept job" fullWidth={false} style={{ flex: 1.4 }} onPress={() => setStatus("accepted")} />
      </View>
    ) : active ? (
      <View style={{ gap: spacing.sm }}>
        <Button
          label={NEXT_LABEL[status] ?? "Continue"}
          onPress={advance}
          variant={status === "in_progress" ? "success" : "primary"}
        />
        {status === "in_progress" ? (
          <Button label="Pause job" variant="secondary" onPress={() => setStatus("paused")} />
        ) : null}
      </View>
    ) : done ? (
      <Button label="Generate invoice" variant="secondary" onPress={() => Alert.alert("Invoice", "Invoice PDF generated and sent to the customer.")} />
    ) : undefined;

  return (
    <Screen footer={footer}>
      <ScreenHeader
        title={job.reference}
        subtitle={job.category}
        onBack={() => navigation.goBack()}
        right={<StatusChip label={JOB_STATUS_LABEL[status]} tone={done ? "success" : active ? "info" : "warning"} />}
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
              <PhotoSlot label="Before" count={before} onAdd={() => setBefore((c) => c + 1)} />
              <PhotoSlot label="After" count={after} onAdd={() => setAfter((c) => c + 1)} />
            </View>
          </Card>

          <Card title="Work notes">
            <Input
              placeholder="What did you do on this job?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </Card>

          <Card title="Materials used">
            {job.materials?.length ? (
              job.materials.map((m) => (
                <Row key={m.name} label={`${m.name} × ${m.qty}`} value={fmtPKR(m.cost)} />
              ))
            ) : (
              <Text style={[typography.caption, { color: colors.textMuted }]}>No materials recorded.</Text>
            )}
            <Button
              label="Add material"
              variant="ghost"
              onPress={() => Alert.alert("Materials", "Material entry form opens here.")}
            />
          </Card>

          <Card title="Customer signature">
            <Pressable
              accessibilityRole="button"
              onPress={() => setSigned(true)}
              style={[styles.sign, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[typography.caption, { color: signed ? colors.success : colors.textMuted }]}>
                {signed ? "✓ Signed by " + job.customer.name : "Tap to capture signature"}
              </Text>
            </Pressable>
          </Card>
        </>
      ) : null}

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Decline this job?">
        <View style={{ gap: spacing.sm }}>
          {["Too far away", "Not available at that time", "Outside my skill set", "Price too low"].map((r) => (
            <Button
              key={r}
              label={r}
              variant="secondary"
              onPress={() => {
                setSheet(false);
                navigation.goBack();
              }}
            />
          ))}
          <Button
            label="Propose another time"
            variant="ghost"
            onPress={() => {
              setSheet(false);
              Alert.alert("Counter schedule", "Send the customer an alternative time slot.");
            }}
          />
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
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
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
