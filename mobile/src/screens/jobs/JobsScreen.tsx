import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { spacing } from "@/theme";
import { Button, EmptyState, JobCard, Screen, ScreenHeader, Segmented, SkeletonList } from "@/components";
import { useAppData } from "@/context/AppDataContext";
import type { Job } from "@/data/jobs";
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
  const { jobs, acceptJob, declineJob } = useAppData();
  const [filter, setFilter] = useState<Filter>(route.params?.filter ?? "requests");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const list = useMemo(() => jobs.filter(MATCH[filter]), [jobs, filter]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setLoading(true);
    setTimeout(() => setLoading(false), 350);
  };

  const decline = (job: Job) =>
    Alert.alert("Decline job", `Decline ${job.reference}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: () => declineJob(job.id, "Declined from list"),
      },
    ]);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader
        title="Jobs"
        subtitle="Requests, active work and history"
        right={<Button label="History" variant="ghost" size="md" fullWidth={false} onPress={() => navigation.navigate("JobHistory")} />}
      />
      <Segmented
        options={FILTERS.map((f) => ({ ...f, count: jobs.filter(MATCH[f.value]).length }))}
        value={filter}
        onChange={changeFilter}
      />

      {loading ? (
        <SkeletonList rows={3} />
      ) : list.length ? (
        <View style={{ gap: spacing.sm }}>
          {list.map((job) => (
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
                      onPress={() => decline(job)}
                    />
                    <Button
                      label="Accept"
                      size="md"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={() => {
                        acceptJob(job.id);
                        navigation.navigate("JobDetail", { jobId: job.id });
                      }}
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
