import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, LayoutGrid, Rows3, Star, Plus, Ban, PauseCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money, num } from "@/components/admin/kit";
import { adminTechnicians, verificationStatusMeta } from "@/data/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/technicians")({
  head: () => ({
    meta: [
      { title: "Technicians — ServicePro Admin" },
      { name: "description", content: "Manage the technician roster: performance, availability, documents and employment status." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Technicians — ServicePro Admin" },
      { property: "og:description", content: "Manage the ServicePro technician roster and performance." },
    ],
  }),
  component: TechniciansPage,
});

function TechniciansPage() {
  const [view, setView] = useState<"table" | "cards">("table");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const rows = adminTechnicians.filter(
    (t) =>
      (status === "all" || t.status === status) &&
      [t.name, t.city, t.services.join(" ")].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Technicians"
        description="Only approved technicians appear to customers and receive bookings."
        crumbs={[{ label: "Technicians" }]}
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/verification">Verification queue</Link>
            </Button>
            <Button size="sm" className="btn-press gap-1.5" onClick={() => toast.success("Manual technician draft created (demo)")}>
              <Plus className="h-4 w-4" /> Add technician
            </Button>
          </>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search technicians, cities, skills…" className="h-9 pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(verificationStatusMeta).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border p-0.5">
            {([["table", Rows3], ["cards", LayoutGrid]] as const).map(([k, Icon]) => (
              <button
                key={k}
                onClick={() => setView(k)}
                className={cn("grid h-7 w-8 place-items-center rounded-md transition-colors", view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Wrench} title="No technicians found" description="Adjust your search or status filter to find people on the roster." />
        ) : view === "table" ? (
          <TableShell>
            <thead>
              <tr>
                <Th>Technician</Th><Th>Services</Th><Th className="text-right">Rating</Th>
                <Th className="text-right">Jobs</Th><Th className="text-right">Revenue</Th>
                <Th>Availability</Th><Th>Status</Th><Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <Tr key={t.id}>
                  <Td>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarImage src={t.avatar} alt={t.name} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
                      <span>
                        <span className="block font-medium">{t.name}</span>
                        <span className="block text-xs text-muted-foreground">{t.city} · {t.experience} yrs</span>
                      </span>
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{t.services.join(", ")}</Td>
                  <Td className="text-right font-medium">{t.rating.toFixed(1)}</Td>
                  <Td className="text-right">{num(t.jobs)}</Td>
                  <Td className="text-right font-semibold">{money(t.revenue)}</Td>
                  <Td><StatusPill label={t.availability} tone={t.availability === "available" ? "emerald" : t.availability === "busy" ? "amber" : "slate"} /></Td>
                  <Td><StatusPill {...verificationStatusMeta[t.status]} /></Td>
                  <Td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="sm" variant="ghost">Actions</Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.success("Schedule opened (demo)")}>View schedule</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Job assigned (demo)")}>Assign job</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Analytics opened (demo)")}>Performance analytics</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`${t.name} suspended (demo)`)}>Suspend</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => toast.success(`${t.name} blocked (demo)`)}>Block</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((t) => (
              <article key={t.id} className="rounded-2xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_oklch(0.2_0.04_265/0.45)]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11"><AvatarImage src={t.avatar} alt={t.name} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                  <StatusPill {...verificationStatusMeta[t.status]} />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Rating", t.rating.toFixed(1)], ["Jobs", num(t.jobs)], ["Revenue", money(t.revenue)]].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-muted/60 p-2">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                      <dd className="text-sm font-semibold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => toast.success("Suspended (demo)")}>
                    <PauseCircle className="h-4 w-4" /> Suspend
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-destructive" onClick={() => toast.success("Blocked (demo)")}>
                    <Ban className="h-4 w-4" /> Block
                  </Button>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {t.certificates.length} certificates on file · bank {t.bank}
                </p>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
