import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme";
import { Banner, Button, Card, JobCard, ListRow, Screen, ScreenHeader, Segmented } from "@/components";
import { CALENDAR_LOAD, JOBS, WORKING_HOURS } from "@/data/jobs";
import type { TabScreenProps } from "@/navigation/types";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function CalendarScreen({ navigation }: TabScreenProps<"Calendar">) {
  const { colors } = useTheme();
  const [view, setView] = useState<"month" | "week">("month");
  const [selected, setSelected] = useState(15);
  const [vacation, setVacation] = useState(false);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const dayJobs = JOBS.filter((j) => j.status !== "cancelled").slice(0, CALENDAR_LOAD[selected] ?? 0);

  return (
    <Screen>
      <ScreenHeader title="Calendar" subtitle="August 2026" />
      <Segmented
        options={[
          { label: "Month", value: "month" as const },
          { label: "Week", value: "week" as const },
        ]}
        value={view}
        onChange={setView}
      />

      {vacation ? (
        <Banner tone="warning" glyph="🌴" title="Vacation mode is on" message="You won't receive job requests until you turn it off." />
      ) : null}

      <Card>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d, i) => (
            <Text key={i} style={[typography.overline, styles.cell, { color: colors.textMuted }]}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {(view === "month" ? days : days.slice(11, 18)).map((d) => {
            const load = CALENDAR_LOAD[d] ?? 0;
            const active = d === selected;
            return (
              <Pressable
                key={d}
                accessibilityRole="button"
                accessibilityLabel={`${d} August, ${load} jobs`}
                onPress={() => setSelected(d)}
                style={[
                  styles.day,
                  view === "week" && { width: `${100 / 7}%` },
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    { color: active ? colors.textInverse : colors.text, fontWeight: active ? "700" : "400" },
                  ]}
                >
                  {d}
                </Text>
                <View style={styles.dots}>
                  {Array.from({ length: Math.min(load, 3) }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, { backgroundColor: active ? colors.textInverse : colors.primary }]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card title={`${selected} August`} subtitle={`${dayJobs.length} job${dayJobs.length === 1 ? "" : "s"} scheduled`}>
        {dayJobs.length ? (
          <View style={{ gap: spacing.sm }}>
            {dayJobs.map((j) => (
              <JobCard key={j.id} job={j} onPress={() => navigation.navigate("JobDetail", { jobId: j.id })} />
            ))}
          </View>
        ) : (
          <Text style={[typography.caption, { color: colors.textMuted }]}>Nothing booked — you're free.</Text>
        )}
      </Card>

      <Card title="Working hours">
        {WORKING_HOURS.map((w) => (
          <ListRow
            key={w.day}
            label={w.day}
            description={w.hours}
            right={<Switch value={w.on} trackColor={{ true: colors.success, false: colors.border }} />}
          />
        ))}
      </Card>

      <Card title="Availability">
        <ListRow
          glyph="🌴"
          label="Vacation mode"
          description="Pause all incoming requests"
          right={
            <Switch
              value={vacation}
              onValueChange={setVacation}
              trackColor={{ true: colors.warning, false: colors.border }}
            />
          }
        />
        <Button label="Leave requests" variant="secondary" onPress={() => navigation.navigate("LeaveRequests")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekRow: { flexDirection: "row", marginBottom: spacing.xs },
  cell: { width: `${100 / 7}%`, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    gap: 2,
  },
  dots: { flexDirection: "row", gap: 2, height: 4 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
