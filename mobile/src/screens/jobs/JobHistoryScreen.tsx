import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { spacing } from "@/theme";
import { Card, EmptyState, Input, JobCard, Row, Screen, ScreenHeader, Segmented } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import { fmtPKR } from "@/data/jobs";
import type { ScreenProps } from "@/navigation/types";

type Range = "all" | "completed" | "cancelled";

export default function JobHistoryScreen({ navigation }: ScreenProps<"JobHistory">) {
  const { jobs } = useAppData();
  const [range, setRange] = useState<Range>("all");
  const [query, setQuery] = useState("");

  const history = useMemo(
    () =>
      jobs
        .filter((j) => ["completed", "verified", "cancelled"].includes(j.status))
        .filter((j) =>
          range === "all"
            ? true
            : range === "cancelled"
              ? j.status === "cancelled"
              : j.status !== "cancelled",
        )
        .filter((j) =>
          `${j.title} ${j.reference} ${j.customer.name}`.toLowerCase().includes(query.trim().toLowerCase()),
        ),
    [jobs, range, query],
  );

  const earned = history
    .filter((j) => j.status !== "cancelled")
    .reduce((sum, j) => sum + j.price, 0);

  return (
    <Screen>
      <ScreenHeader title="Job history" subtitle="Everything you've worked on" onBack={() => navigation.goBack()} />
      <Input placeholder="Search by job, reference or customer" value={query} onChangeText={setQuery} />
      <Segmented
        options={[
          { label: "All", value: "all" as const },
          { label: "Completed", value: "completed" as const },
          { label: "Cancelled", value: "cancelled" as const },
        ]}
        value={range}
        onChange={setRange}
      />

      <Card title="Summary">
        <Row label="Jobs shown" value={`${history.length}`} />
        <Row label="Value delivered" value={fmtPKR(earned)} />
      </Card>

      {history.length ? (
        <View style={{ gap: spacing.sm }}>
          {history.map((j) => (
            <JobCard key={j.id} job={j} onPress={() => navigation.navigate("JobDetail", { jobId: j.id })} />
          ))}
        </View>
      ) : (
        <EmptyState glyph="🗂" title="No matching jobs" message="Try a different filter or search term." />
      )}
    </Screen>
  );
}
