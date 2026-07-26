import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
} from "recharts";
import { Download, TrendingUp, TrendingDown, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money } from "@/components/admin/kit";
import { reportCards, revenueSeries, weeklySeries, serviceDistribution } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — ServicePro Admin" },
      { name: "description", content: "Revenue, bookings, customer growth and technician utilisation reporting with exports." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reports — ServicePro Admin" },
      { property: "og:description", content: "Revenue, bookings and utilisation reporting with exports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "12m">("30d");

  return (
    <>
      <PageHeader
        title="Reports"
        description="Operational and financial performance across the whole marketplace."
        crumbs={[{ label: "Reports" }]}
        actions={
          <>
            <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <TabsList>
                <TabsTrigger value="7d">7 days</TabsTrigger>
                <TabsTrigger value="30d">30 days</TabsTrigger>
                <TabsTrigger value="12m">12 months</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success("CSV export queued (demo)")}>
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </Button>
            <Button size="sm" className="btn-press gap-1.5" onClick={() => toast.success("PDF export queued (demo)")}>
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((c) => {
          const up = !c.delta.startsWith("-");
          return (
            <Panel key={c.id}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.name}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold tracking-tight">{c.value}</p>
                <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-success" : "text-destructive"}`}>
                  {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {c.delta}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.period}</p>
            </Panel>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Revenue & bookings" description={range === "7d" ? "Last 7 days" : range === "30d" ? "Rolling monthly view" : "Trailing 12 months"}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={range === "7d" ? weeklySeries : revenueSeries}>
                <defs>
                  <linearGradient id="rep-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 265)" vertical={false} />
                <XAxis dataKey={range === "7d" ? "day" : "month"} tick={{ fontSize: 12 }} stroke="oklch(0.6 0.02 265)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.6 0.02 265)" />
                <RTooltip formatter={(v: number, n) => (n === "revenue" ? money(v) : v)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.22 264)" fill="url(#rep-rev)" strokeWidth={2.5} animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Bookings by service">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistribution} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 265)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="oklch(0.6 0.02 265)" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} stroke="oklch(0.6 0.02 265)" />
                <RTooltip />
                <Bar dataKey="value" fill="oklch(0.55 0.22 264)" radius={[0, 8, 8, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4" title="Scheduled reports" bodyClassName="p-0"
        actions={<Button size="sm" variant="outline" onClick={() => toast.success("Schedule created (demo)")}>New schedule</Button>}>
        <TableShell>
          <thead>
            <tr><Th>Report</Th><Th>Frequency</Th><Th>Recipients</Th><Th>Format</Th><Th>Status</Th><Th className="text-right">Action</Th></tr>
          </thead>
          <tbody>
            {[
              ["Revenue summary", "Weekly · Monday 08:00", "finance@servicepro.io", "PDF", "Active"],
              ["Bookings volume", "Daily · 23:00", "ops@servicepro.io", "CSV", "Active"],
              ["Technician utilisation", "Monthly · 1st", "dana@servicepro.io", "PDF", "Active"],
              ["Cancellation analysis", "Monthly · 1st", "quality@servicepro.io", "CSV", "Paused"],
            ].map((r) => (
              <Tr key={r[0]}>
                <Td className="font-semibold">{r[0]}</Td>
                <Td className="text-muted-foreground">{r[1]}</Td>
                <Td className="text-muted-foreground">{r[2]}</Td>
                <Td>{r[3]}</Td>
                <Td><StatusPill label={r[4]} tone={r[4] === "Active" ? "emerald" : "slate"} /></Td>
                <Td className="text-right">
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => toast.success("Download started (demo)")}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>
    </>
  );
}
