import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, LayoutGrid, Rows3, Star, LoaderCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money, num } from "@/components/admin/kit";
import { api, type ApiTechnician } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/technicians")({
  head: () => ({ meta: [{ title: "Technicians — ServicePro Admin" }, { name: "robots", content: "noindex" }] }),
  component: TechniciansPage,
});

type VerificationStatus = NonNullable<ApiTechnician["verificationStatus"]>;
const verificationStatusMeta: Record<VerificationStatus, { label: string; tone: "amber" | "blue" | "emerald" | "red" | "slate" }> = {
  pending: { label: "Pending", tone: "amber" }, under_review: { label: "Under review", tone: "blue" },
  approved: { label: "Approved", tone: "emerald" }, rejected: { label: "Rejected", tone: "red" }, suspended: { label: "Suspended", tone: "slate" },
};
const statuses = Object.keys(verificationStatusMeta) as VerificationStatus[];
const personName = (t: ApiTechnician) => t.user?.name || "Unnamed technician";
const initial = (t: ApiTechnician) => personName(t).charAt(0).toUpperCase();

function TechniciansPage() {
  const [view, setView] = useState<"table" | "cards">("table");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const { data: technicians = [], isLoading, isError, refetch } = useQuery({ queryKey: ["admin-technicians"], queryFn: () => api.technicians.adminList("?limit=100") });
  const rows = technicians.filter((t) => (status === "all" || t.verificationStatus === status) && [personName(t), t.user?.email, t.city, t.services.join(" ")].join(" ").toLowerCase().includes(q.toLowerCase()));

  return <>
    <PageHeader title="Technicians" description="Live roster. Only approved technicians appear to customers and receive bookings." crumbs={[{ label: "Technicians" }]} actions={<Button asChild variant="outline" size="sm"><Link to="/admin/verification">Verification queue</Link></Button>} />
    <Panel bodyClassName="p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4"><div className="relative min-w-[200px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search technicians, cities, skills…" className="h-9 pl-9" /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map((key) => <SelectItem key={key} value={key}>{verificationStatusMeta[key].label}</SelectItem>)}</SelectContent></Select><div className="flex rounded-lg border border-border p-0.5">{([["table", Rows3], ["cards", LayoutGrid]] as const).map(([key, Icon]) => <button key={key} onClick={() => setView(key)} className={cn("grid h-7 w-8 place-items-center rounded-md transition-colors", view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}><Icon className="h-4 w-4" /></button>)}</div></div>
      {isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading technicians…</div> : isError ? <EmptyState icon={Wrench} title="Could not load technicians" description="Check the backend connection and your administrator session." action={<Button size="sm" onClick={() => refetch()}>Try again</Button>} /> : rows.length === 0 ? <EmptyState icon={Wrench} title="No technicians found" description="Adjust your search or status filter to find people on the roster." /> : view === "table" ? <RosterTable rows={rows} /> : <RosterCards rows={rows} />}
    </Panel>
  </>;
}

function ReviewLink({ technician }: { technician: ApiTechnician }) { return <Button asChild size="sm" variant="outline"><Link to="/admin/verification/$techId" params={{ techId: technician._id }}>{technician.verificationStatus === "approved" ? "View profile" : "Review"}</Link></Button>; }
function RosterTable({ rows }: { rows: ApiTechnician[] }) { return <TableShell><thead><tr><Th>Technician</Th><Th>Services</Th><Th className="text-right">Rating</Th><Th className="text-right">Jobs</Th><Th className="text-right">Hourly rate</Th><Th>Availability</Th><Th>Status</Th><Th /></tr></thead><tbody>{rows.map((t) => <Tr key={t._id}><Td><span className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={t.user?.avatarUrl} alt={personName(t)} /><AvatarFallback>{initial(t)}</AvatarFallback></Avatar><span><span className="block font-medium">{personName(t)}</span><span className="block text-xs text-muted-foreground">{t.city} · {t.experienceYears} yrs</span></span></span></Td><Td className="max-w-56 truncate text-muted-foreground">{t.services.join(", ") || "—"}</Td><Td className="text-right font-medium">{t.rating.toFixed(1)}</Td><Td className="text-right">{num(t.jobsCompleted)}</Td><Td className="text-right font-semibold">{money(t.hourlyRate)}</Td><Td><StatusPill label={t.isAvailable ? "Available" : "Unavailable"} tone={t.isAvailable ? "emerald" : "slate"} /></Td><Td><StatusPill {...verificationStatusMeta[t.verificationStatus ?? "pending"]} /></Td><Td className="text-right"><ReviewLink technician={t} /></Td></Tr>)}</tbody></TableShell>; }
function RosterCards({ rows }: { rows: ApiTechnician[] }) { return <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((t) => <article key={t._id} className="rounded-2xl border border-border p-4"><div className="flex items-center gap-3"><Avatar className="h-11 w-11"><AvatarImage src={t.user?.avatarUrl} alt={personName(t)} /><AvatarFallback>{initial(t)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{personName(t)}</p><p className="text-xs text-muted-foreground">{t.city}</p></div><StatusPill {...verificationStatusMeta[t.verificationStatus ?? "pending"]} /></div><dl className="mt-4 grid grid-cols-3 gap-2 text-center">{[["Rating", t.rating.toFixed(1)], ["Jobs", num(t.jobsCompleted)], ["Rate", money(t.hourlyRate)]].map(([label, value]) => <div key={label} className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="text-sm font-semibold tabular-nums">{value}</dd></div>)}</dl><p className="mt-3 truncate text-xs text-muted-foreground">{t.services.join(", ") || "No services selected"}</p><div className="mt-4 flex items-center justify-between"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{t.isAvailable ? "Available now" : "Currently unavailable"}</span><ReviewLink technician={t} /></div></article>)}</div>; }
