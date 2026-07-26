import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LifeBuoy, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr } from "@/components/admin/kit";
import { supportTickets, type SupportTicket, type Tone } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support Tickets — ServicePro Admin" },
      { name: "description", content: "Triage customer and technician support tickets by priority, status and agent." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Support Tickets — ServicePro Admin" },
      { property: "og:description", content: "Triage customer and technician support tickets." },
    ],
  }),
  component: SupportPage,
});

const priorityTone: Record<SupportTicket["priority"], Tone> = {
  urgent: "red", high: "amber", medium: "blue", low: "slate",
};
const statusTone: Record<SupportTicket["status"], Tone> = {
  open: "amber", pending: "blue", resolved: "emerald", closed: "slate",
};

function SupportPage() {
  const [tab, setTab] = useState<"all" | SupportTicket["status"]>("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");

  const filtered = useMemo(
    () =>
      supportTickets.filter((t) => {
        const matchTab = tab === "all" || t.status === tab;
        const s = q.toLowerCase();
        const matchQ = !s || [t.id, t.subject, t.requester, t.agent].some((v) => v.toLowerCase().includes(s));
        return matchTab && matchQ;
      }),
    [tab, q],
  );

  const counts = {
    open: supportTickets.filter((t) => t.status === "open").length,
    urgent: supportTickets.filter((t) => t.priority === "urgent").length,
    resolved: supportTickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <>
      <PageHeader
        title="Support Tickets"
        description="Everything customers and technicians report, in one triage inbox."
        crumbs={[{ label: "Support" }]}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Open tickets", value: counts.open, tone: "amber" as Tone },
          { label: "Urgent priority", value: counts.urgent, tone: "red" as Tone },
          { label: "Resolved this week", value: counts.resolved, tone: "emerald" as Tone },
        ].map((c) => (
          <Panel key={c.label}>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-semibold tracking-tight">{c.value}</p>
              <StatusPill label="SLA 4h" tone={c.tone} />
            </div>
          </Panel>
        ))}
      </div>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets…" className="h-9 pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="Inbox zero" description="No tickets match this filter right now." />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ticket</Th><Th>Requester</Th><Th>Category</Th><Th>Priority</Th>
                <Th>Status</Th><Th>Agent</Th><Th className="text-right">Updated</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <Tr key={t.id} onClick={() => setActive(t)}>
                  <Td>
                    <p className="font-semibold">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.id} · {t.messages} messages</p>
                  </Td>
                  <Td>{t.requester}</Td>
                  <Td className="text-muted-foreground">{t.category}</Td>
                  <Td><StatusPill label={t.priority} tone={priorityTone[t.priority]} /></Td>
                  <Td><StatusPill label={t.status} tone={statusTone[t.status]} /></Td>
                  <Td className="text-muted-foreground">{t.agent}</Td>
                  <Td className="text-right text-muted-foreground">{t.updated}</Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>{active?.subject}</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <StatusPill label={active.priority} tone={priorityTone[active.priority]} />
                <StatusPill label={active.status} tone={statusTone[active.status]} />
                <StatusPill label={active.category} tone="slate" />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Ticket", active.id], ["Requester", active.requester],
                  ["Assigned agent", active.agent], ["Last update", active.updated],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border p-3">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-3">
                <p className="text-sm font-semibold">Conversation</p>
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
                  <p className="text-xs font-semibold">{active.requester}</p>
                  <p className="mt-1 text-muted-foreground">
                    Hi team — following up on this. Could you confirm the next step and a timeline?
                  </p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm">
                  <p className="text-xs font-semibold text-primary">{active.agent}</p>
                  <p className="mt-1 text-muted-foreground">
                    Thanks for reaching out — we're reviewing the booking record and will update you shortly.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" rows={4} />
                <div className="flex gap-2">
                  <Button
                    className="btn-press gap-1.5"
                    disabled={!reply.trim()}
                    onClick={() => { setReply(""); toast.success("Reply sent (demo)"); }}
                  >
                    <Send className="h-4 w-4" /> Send reply
                  </Button>
                  <Button variant="outline" onClick={() => { setActive(null); toast.success("Ticket resolved (demo)"); }}>
                    Mark resolved
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
