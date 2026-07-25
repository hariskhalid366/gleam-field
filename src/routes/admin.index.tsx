import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  CalendarCheck, Clock3, CheckCircle2, XCircle, DollarSign, ShieldCheck, Wrench, UserPlus,
  Star, ArrowUpRight, ArrowDownRight, Plus, Send, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GlossyIcon, PageHeader, Panel, StatusPill, money, num, toneClass,
} from "@/components/admin/kit";
import {
  activityFeed, adminBookings, adminCustomers, adminReviews, adminTechnicians,
  bookingStatusMeta, revenueSeries, serviceDistribution, upcomingJobs, weeklySeries,
  pendingVerificationCount, type Tone,
} from "@/data/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ServicePro Admin" },
      { name: "description", content: "Live operational overview: bookings, revenue, technician approvals and service performance." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — ServicePro Admin" },
      { property: "og:description", content: "Live operational overview of the ServicePro field service business." },
    ],
  }),
  component: Dashboard,
});

function useCounter(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function StatCard({
  icon, tone, label, value, prefix = "", suffix = "", delta, sub,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: Tone; label: string; value: number; prefix?: string; suffix?: string; delta?: number; sub?: string;
}) {
  const v = useCounter(value);
  const up = (delta ?? 0) >= 0;
  return (
    <div className="group rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_oklch(0.2_0.04_265/0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-18px_oklch(0.2_0.04_265/0.35)]">
      <div className="flex items-start justify-between">
        <GlossyIcon icon={icon} tone={tone} />
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
              up ? toneClass.emerald : toneClass.red,
            )}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
        {prefix}{num(v)}{suffix}
      </p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground/80">{sub}</p>}
    </div>
  );
}

const PIE = ["oklch(0.55 0.22 264)", "oklch(0.68 0.17 155)", "oklch(0.78 0.16 70)", "oklch(0.65 0.12 300)", "oklch(0.62 0.13 215)", "oklch(0.75 0.02 255)"];

function Dashboard() {
  const [range, setRange] = useState<"weekly" | "monthly">("monthly");
  const revenueData = range === "monthly"
    ? revenueSeries.map((r) => ({ label: r.month, revenue: r.revenue, bookings: r.bookings }))
    : weeklySeries.map((r) => ({ label: r.day, revenue: r.revenue, bookings: r.bookings }));

  const completed = adminBookings.filter((b) => b.status === "completed").length;
  const cancelled = adminBookings.filter((b) => b.status === "cancelled").length;
  const pending = adminBookings.filter((b) => b.status === "pending").length;
  const activeTechs = adminTechnicians.filter((t) => t.status === "approved").length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything happening across ServicePro right now."
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="btn-press gap-1.5">
              <Link to="/admin/verification"><ShieldCheck className="h-4 w-4" /> Approve technician</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="btn-press gap-1.5">
              <Link to="/admin/bookings"><Plus className="h-4 w-4" /> Create booking</Link>
            </Button>
            <Button asChild size="sm" className="btn-press gap-1.5">
              <Link to="/admin/notifications"><Send className="h-4 w-4" /> Send notification</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={CalendarCheck} tone="blue" label="Today's bookings" value={38} delta={12} />
        <StatCard icon={Clock3} tone="amber" label="Pending jobs" value={pending * 3 + 5} delta={-4} />
        <StatCard icon={CheckCircle2} tone="emerald" label="Completed jobs" value={completed * 41} delta={9} />
        <StatCard icon={XCircle} tone="red" label="Cancelled jobs" value={cancelled * 7} delta={-2} />
        <StatCard
          icon={DollarSign} tone="indigo"
          label={range === "monthly" ? "Revenue (monthly)" : "Revenue (weekly)"}
          value={range === "monthly" ? 81250 : 81250 / 4}
          prefix="$" delta={8}
          sub={
            <>
            </> as unknown as string
          }
        />
        <StatCard icon={ShieldCheck} tone="violet" label="Pending approvals" value={pendingVerificationCount} delta={20} />
        <StatCard icon={Wrench} tone="cyan" label="Active technicians" value={activeTechs} sub={`${adminTechnicians.length - activeTechs} inactive`} delta={5} />
        <StatCard icon={UserPlus} tone="emerald" label="Customer growth" value={468} delta={16} />
        <StatCard icon={Star} tone="amber" label="Average rating" value={482} prefix="" delta={1} sub="4.82 out of 5.00" />
        <StatCard icon={TrendingUp} tone="blue" label="Utilisation" value={78} suffix="%" delta={3} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Revenue & bookings"
          description="Gross revenue with booking volume overlay."
          actions={
            <div className="flex rounded-lg border border-border p-0.5">
              {(["weekly", "monthly"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ left: -18, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 255)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 255)" />
              <RTooltip
                contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }}
                formatter={(v: number, n: string) => [n === "revenue" ? money(v) : num(v), n]}
              />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.22 264)" strokeWidth={2.5} fill="url(#rev)" isAnimationActive animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Service distribution" description="Share of completed jobs by category.">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={serviceDistribution} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3} isAnimationActive animationDuration={900}>
                {serviceDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-3 space-y-1.5">
            {serviceDistribution.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE[i % PIE.length] }} />
                <span className="flex-1 text-muted-foreground">{s.name}</span>
                <span className="font-semibold tabular-nums">{num(s.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Bookings by week" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklySeries} margin={{ left: -20, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 255)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 255)" />
              <RTooltip cursor={{ fill: "oklch(0.96 0.01 255)" }} contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }} />
              <Bar dataKey="bookings" radius={[8, 8, 0, 0]} fill="oklch(0.55 0.22 264)" isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top performing technicians" actions={<Link to="/admin/technicians" className="text-xs font-semibold text-primary hover:underline">View all</Link>}>
          <ol className="space-y-3">
            {adminTechnicians.filter((t) => t.status === "approved").sort((a, b) => b.jobs - a.jobs).slice(0, 5).map((t, i) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <Avatar className="h-9 w-9"><AvatarImage src={t.avatar} alt={t.name} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.services[0]} · {num(t.jobs)} jobs</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {t.rating.toFixed(1)}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Recent bookings" actions={<Link to="/admin/bookings" className="text-xs font-semibold text-primary hover:underline">View all</Link>}>
          <ul className="space-y-3">
            {adminBookings.slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarImage src={b.customerAvatar} alt={b.customer} /><AvatarFallback>{b.customer[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.service}</p>
                  <p className="text-xs text-muted-foreground">{b.customer} · {b.id}</p>
                </div>
                <StatusPill {...bookingStatusMeta[b.status]} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Upcoming jobs">
          <ul className="space-y-3">
            {upcomingJobs.map((b) => (
              <li key={b.id} className="rounded-xl border border-border p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{b.service}</p>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">{b.date} · {b.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{b.technician ?? "Unassigned"} → {b.customer}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent activity">
          <ol className="relative space-y-4 border-l border-border pl-4">
            {activityFeed.map((a) => (
              <li key={a.id} className="relative">
                <span className={cn("absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card", toneClass[a.tone])} />
                <p className="text-sm">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                </p>
                <p className="text-[11px] tabular-nums text-muted-foreground">{a.time}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Latest reviews" actions={<Link to="/admin/reviews" className="text-xs font-semibold text-primary hover:underline">View all</Link>}>
          <ul className="space-y-3">
            {adminReviews.slice(0, 4).map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7"><AvatarImage src={r.customerAvatar} alt={r.customer} /><AvatarFallback>{r.customer[0]}</AvatarFallback></Avatar>
                  <p className="text-sm font-medium">{r.customer}</p>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold tabular-nums">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating}.0
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{r.comment}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Latest customers" actions={<Link to="/admin/customers" className="text-xs font-semibold text-primary hover:underline">View all</Link>}>
          <ul className="space-y-3">
            {adminCustomers.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarImage src={c.avatar} alt={c.name} /><AvatarFallback>{c.name[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.city} · joined {c.joined}</p>
                </div>
                <span className="text-xs font-semibold tabular-nums">{money(c.spend)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Latest technicians" actions={<Link to="/admin/verification" className="text-xs font-semibold text-primary hover:underline">Verification queue</Link>}>
          <ul className="space-y-3">
            {adminTechnicians.slice(6, 11).map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarImage src={t.avatar} alt={t.name} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.services.join(", ")}</p>
                </div>
                <StatusPill label={t.status.replace("_", " ")} tone={t.status === "approved" ? "emerald" : t.status === "pending" ? "amber" : "blue"} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
