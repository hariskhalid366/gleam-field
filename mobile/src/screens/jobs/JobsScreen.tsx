import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/theme";
import { Button, EmptyState, JobCard, Screen, ScreenHeader, Segmented, SkeletonList } from "@/components";
import { JOBS, type Job } from "@/data/jobs";
import type { TabScreenProps } from "@/navigation/types";

type Filter = "requests" | "active" | "upcoming" | "completed" | "cancelled";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Requests", value: "requests" },
  { label: "Active", value: "active" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Done", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const MATCH: Record<Filter, (j: Job) => boolean> = {
  requests: (j) => j.status === "pending",
  active: (j) => ["accepted", "travelling", "arrived", "in_progress", "paused"].includes(j.status),
  upcoming: (j) => j.status === "assigned" || (j.status === "accepted" && j.scheduledFor !== "Today"),
  completed: (j) => j.status === "completed" || j.status === "verified",
  cancelled: (j) => j.status === "cancelled",
};

export default function JobsScreen({ navigation, route }: TabScreenProps<"Jobs">) {
  const [filter, setFilter] = useState<Filter>(route.params?.filter ?? "requests");
  const [refreshing, setRefreshing] = useState(false);
  const [loading] = useState(false);

  const jobs = useMemo(() => JOBS.filter(MATCH[filter]), [filter]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader title="Jobs" subtitle="Requests, active work and history" />
      <Segmented
        options={FILTERS.map((f) => ({ ...f, count: JOBS.filter(MATCH[f.value]).length }))}
        value={filter}
        onChange={setFilter}
      />

      {loading ? (
        <SkeletonList rows={3} />
      ) : jobs.length ? (
        <View style={{ gap: spacing.sm }}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
              footer={
                filter === "requests" ? (
                  <View style={styles.actions}>
                    <Button
                      label="Reject"
                      variant="secondary"
                      size="md"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
                    />
                    <Button
                      label="Accept"
                      size="md"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
                    />
                  </View>
                ) : null
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          glyph={filter === "requests" ? "📭" : "🗂"}
          title={filter === "requests" ? "No job requests" : "Nothing here yet"}
          message={
            filter === "requests"
              ? "Go online from your dashboard to start receiving requests."
              : "Jobs will appear here as your schedule fills up."
          }
          actionLabel="Go to dashboard"
          onAction={() => navigation.navigate("Dashboard")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
});
