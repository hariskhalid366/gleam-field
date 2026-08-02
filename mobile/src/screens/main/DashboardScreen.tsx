import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import {
  Banner,
  Card,
  EmptyState,
  JobCard,
  MetricBar,
  Rating,
  Screen,
  ScreenHeader,
  StatCard,
  StatusChip,
} from "@/components";
import { useAuth } from "@/context/AuthContext";
import { ACTIVITIES, EARNINGS, JOBS, NOTIFICATIONS, PERFORMANCE, fmtPKR } from "@/data/jobs";
import type { TabScreenProps } from "@/navigation/types";

export default function DashboardScreen({ navigation }: TabScreenProps<"Dashboard">) {
  const { colors } = useTheme();
  const { technician, status } = useAuth();
  const suspended = status === "suspended";
  const [online, setOnline] = useState(!suspended);
  const [refreshing, setRefreshing] = useState(false);

  const requests = JOBS.filter((j) => j.status === "pending");
  const today = JOBS.filter((j) => j.scheduledFor === "Today" && j.status !== "pending");
  const upcoming = JOBS.filter((j) => j.scheduledFor === "Tomorrow");
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader
        title={`Hi, ${technician?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Here's your day at a glance"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unread} unread`}
            onPress={() => navigation.navigate("Notifications")}
            style={[styles.bell, { backgroundColor: colors.surfaceAlt }]}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {unread > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={[typography.overline, { color: colors.textInverse, fontSize: 9 }]}>
                  {unread}
                </Text>
              </View>
            ) : null}
          </Pressable>
        }
      />

      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Availability</Text>
            <Text style={[typography.h3, { color: colors.text }]}>
              {suspended ? "Suspended" : online ? "You're online" : "You're offline"}
            </Text>
            <Rating value={PERFORMANCE.rating} count={PERFORMANCE.reviews} />
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <StatusChip
              label={suspended ? "Suspended" : online ? "Online" : "Offline"}
              tone={suspended ? "danger" : online ? "success" : "neutral"}
            />
            <Switch
              value={online && !suspended}
              disabled={suspended}
              onValueChange={setOnline}
              trackColor={{ true: colors.success, false: colors.border }}
            />
          </View>
        </View>
      </Card>

      {suspended ? (
        <Banner
          tone="danger"
          glyph="⛔"
          title="You can't go online"
          message="Suspended technicians don't receive job requests."
        />
      ) : null}

      <View style={styles.stats}>
        <StatCard label="Today" value={fmtPKR(EARNINGS.today)} tone="primary" onPress={() => navigation.navigate("Earnings")} />
        <StatCard label="This week" value={fmtPKR(EARNINGS.week)} onPress={() => navigation.navigate("Earnings")} />
        <StatCard label="This month" value={fmtPKR(EARNINGS.month)} onPress={() => navigation.navigate("Earnings")} />
      </View>

      <Card
        title="Pending requests"
        subtitle={`${requests.length} waiting for your response`}
        right={<Link label="See all" onPress={() => navigation.navigate("Jobs", { filter: "requests" })} />}
      >
        {requests.length ? (
          <View style={{ gap: spacing.sm }}>
            {requests.slice(0, 2).map((j) => (
              <JobCard key={j.id} job={j} onPress={() => navigation.navigate("JobDetail", { jobId: j.id })} />
            ))}
          </View>
        ) : (
          <EmptyState glyph="📭" title="No requests right now" message="Stay online to receive new jobs." />
        )}
      </Card>

      <Card
        title="Today's jobs"
        subtitle={`${today.length} scheduled`}
        right={<Link label="See all" onPress={() => navigation.navigate("Jobs", { filter: "active" })} />}
      >
        {today.length ? (
          <View style={{ gap: spacing.sm }}>
            {today.map((j) => (
              <JobCard key={j.id} job={j} onPress={() => navigation.navigate("JobDetail", { jobId: j.id })} />
            ))}
          </View>
        ) : (
          <EmptyState glyph="🗓" title="Nothing scheduled today" />
        )}
      </Card>

      <Card title="Upcoming" subtitle={`${upcoming.length} tomorrow`}>
        {upcoming.length ? (
          <View style={{ gap: spacing.sm }}>
            {upcoming.map((j) => (
              <JobCard key={j.id} job={j} onPress={() => navigation.navigate("JobDetail", { jobId: j.id })} />
            ))}
          </View>
        ) : (
          <EmptyState glyph="✨" title="Your calendar is clear" />
        )}
      </Card>

      <Card title="Performance" subtitle={`Score ${PERFORMANCE.score}/100`}>
        <View style={{ gap: spacing.md }}>
          <MetricBar label="Completion rate" value={PERFORMANCE.completionRate} />
          <MetricBar label="Acceptance rate" value={PERFORMANCE.acceptanceRate} />
          <MetricBar label="On-time arrival" value={PERFORMANCE.onTimeRate} />
        </View>
      </Card>

      <Card title="Quick actions">
        <View style={styles.quick}>
          {[
            { glyph: "🗓", label: "Calendar", go: () => navigation.navigate("Calendar") },
            { glyph: "💳", label: "Earnings", go: () => navigation.navigate("Earnings") },
            { glyph: "📄", label: "Documents", go: () => navigation.navigate("Documents") },
            { glyph: "⚙️", label: "Settings", go: () => navigation.navigate("Settings") },
          ].map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={a.go}
              style={({ pressed }) => [
                styles.quickItem,
                { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{a.glyph}</Text>
              <Text style={[typography.caption, { color: colors.text }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card title="Recent activity">
        <View style={{ gap: spacing.sm }}>
          {ACTIVITIES.map((a) => (
            <View key={a.id} style={styles.activity}>
              <Text style={{ fontSize: 16 }}>{a.glyph}</Text>
              <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{a.text}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{a.time}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={[typography.caption, { color: colors.primary, fontWeight: "700" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stats: { flexDirection: "row", gap: spacing.sm },
  bell: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  quick: { flexDirection: "row", gap: spacing.sm },
  quickItem: {
    flex: 1,
    gap: spacing.xs,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  activity: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
