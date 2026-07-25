import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarPlus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { adminTechnicians, bookingStatusMeta, calendarEvents } from "@/data/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — ServicePro Admin" },
      { name: "description", content: "Monthly, weekly and daily dispatch calendar with technician availability and leave." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Calendar — ServicePro Admin" },
      { property: "og:description", content: "Dispatch calendar with technician availability." },
    ],
  }),
  component: CalendarPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarPage() {
  const [view, setView] = useState("month");

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Bookings and technician availability, July 2026."
        crumbs={[{ label: "Calendar" }]}
        actions={
          <>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" className="btn-press gap-1.5" onClick={() => toast.success("Event created (demo)")}>
              <CalendarPlus className="h-4 w-4" /> New event
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel
          className="xl:col-span-3"
          title="July 2026"
          bodyClassName="p-3"
          actions={
            <span className="flex gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </span>
          }
        >
          {view === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => (
                <div key={d} className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 1;
                const events = calendarEvents.filter((e) => e.day === day);
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[92px] rounded-xl border border-border p-1.5 transition-colors hover:bg-muted/50",
                      day < 1 || day > 31 ? "bg-muted/30 opacity-50" : "bg-card",
                    )}
                  >
                    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{day > 0 && day <= 31 ? day : ""}</span>
                    <div className="mt-1 space-y-1">
                      {events.slice(0, 2).map((e) => (
                        <button
                          key={e.id}
                          draggable
                          onClick={() => toast.success(`${e.title} opened (demo)`)}
                          className="block w-full truncate rounded-md bg-primary/10 px-1.5 py-1 text-left text-[10px] font-medium text-primary hover:bg-primary/15"
                        >
                          {e.time} {e.title}
                        </button>
                      ))}
                      {events.length > 2 && <p className="px-1 text-[10px] text-muted-foreground">+{events.length - 2} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "week" && (
            <div className="grid grid-cols-7 gap-2 p-2">
              {days.map((d, i) => (
                <div key={d} className="rounded-xl border border-border p-2">
                  <p className="mb-2 text-xs font-semibold">{d}</p>
                  {calendarEvents.slice(i * 2, i * 2 + 3).map((e) => (
                    <div key={e.id} className="mb-1 rounded-md bg-primary/10 px-1.5 py-1 text-[10px] font-medium text-primary">{e.time} {e.title}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {view === "day" && (
            <ol className="divide-y divide-border">
              {Array.from({ length: 10 }).map((_, i) => {
                const hour = 8 + i;
                const e = calendarEvents[i];
                return (
                  <li key={hour} className="flex gap-4 py-3">
                    <span className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">{String(hour).padStart(2, "0")}:00</span>
                    {e ? (
                      <div className="flex-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                        <p className="text-sm font-medium">{e.title}</p>
                        <StatusPill className="mt-1" {...bookingStatusMeta[e.status]} />
                      </div>
                    ) : (
                      <div className="flex-1 rounded-xl border border-dashed border-border" />
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Technician availability">
            <ul className="space-y-2 text-sm">
              {adminTechnicians.filter((t) => t.status === "approved").slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span className="truncate">{t.name}</span>
                  <StatusPill label={t.availability} tone={t.availability === "available" ? "emerald" : "amber"} />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Leave requests" actions={<Plane className="h-4 w-4 text-muted-foreground" />}>
            <ul className="space-y-3 text-sm">
              {[
                ["Diego Alvarez", "Jul 18 – Jul 22", "pending"],
                ["Sofia Rossi", "Aug 02 – Aug 05", "approved"],
              ].map(([n, d, s]) => (
                <li key={n} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{n}</span>
                    <StatusPill label={s} tone={s === "approved" ? "emerald" : "amber"} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{d}</p>
                  {s === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" className="h-7 flex-1" onClick={() => toast.success("Leave approved (demo)")}>Approve</Button>
                      <Button size="sm" variant="outline" className="h-7 flex-1" onClick={() => toast.success("Leave declined (demo)")}>Decline</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Holidays">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Independence Day</span><span className="tabular-nums">Jul 04</span></li>
              <li className="flex justify-between"><span>Labor Day</span><span className="tabular-nums">Sep 07</span></li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
