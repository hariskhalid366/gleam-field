import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LifeBuoy, LoaderCircle, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr } from "@/components/admin/kit";
import { api, type ApiSupportTicket } from "@/lib/api";
import type { Tone } from "@/components/admin/kit";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({
  head: () => ({ meta: [{ title: "Contact Inbox — ServicePro Admin" }, { name: "robots", content: "noindex" }] }),
  component: SupportPage,
});

const priorityTone: Record<ApiSupportTicket["priority"], Tone> = { urgent: "red", high: "amber", medium: "blue", low: "slate" };
const statusTone: Record<ApiSupportTicket["status"], Tone> = { open: "amber", pending: "blue", resolved: "emerald", closed: "slate" };
const requester = (ticket: ApiSupportTicket) => ticket.requesterName ?? ticket.requester?.name ?? ticket.requesterEmail ?? ticket.requester?.email ?? "Account holder";

function SupportPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | ApiSupportTicket["status"]>("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<ApiSupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const { data: tickets = [], isLoading, isError } = useQuery({ queryKey: ["contact-submissions"], queryFn: api.support.listContactSubmissions });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
  const replyMutation = useMutation({
    mutationFn: () => api.support.reply(active!._id, reply.trim()),
    onSuccess: (ticket) => { refresh(); setActive(ticket); setReply(""); toast.success("Reply sent"); },
    onError: showError,
  });
  const resolveMutation = useMutation({
    mutationFn: () => api.support.updateTicket(active!._id, { status: "resolved" }),
    onSuccess: (ticket) => { refresh(); setActive(ticket); toast.success("Ticket marked resolved"); },
    onError: showError,
  });
  const filtered = useMemo(() => tickets.filter((ticket) => {
    const term = search.toLowerCase();
    return (tab === "all" || ticket.status === tab) && (!term || [ticket._id, ticket.subject, requester(ticket), ticket.agent ?? ""].some((value) => value.toLowerCase().includes(term)));
  }), [tickets, tab, search]);
  const counts = { open: tickets.filter((ticket) => ticket.status === "open").length, urgent: tickets.filter((ticket) => ticket.priority === "urgent").length, resolved: tickets.filter((ticket) => ticket.status === "resolved").length };

  return <>
    <PageHeader title="Contact Inbox" description="Messages submitted through the website Contact form. Repeat contacts are automatically urgent." crumbs={[{ label: "Support" }]} />
    <div className="mb-4 grid gap-4 sm:grid-cols-3">{[
      { label: "Open tickets", value: counts.open, tone: "amber" as Tone }, { label: "Urgent priority", value: counts.urgent, tone: "red" as Tone }, { label: "Resolved", value: counts.resolved, tone: "emerald" as Tone },
    ].map((card) => <Panel key={card.label}><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p><div className="mt-2 flex items-center gap-2"><p className="text-2xl font-semibold tracking-tight">{card.value}</p><StatusPill label="Live" tone={card.tone} /></div></Panel>)}</div>
    <Panel bodyClassName="p-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4"><Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="open">Open</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="resolved">Resolved</TabsTrigger><TabsTrigger value="closed">Closed</TabsTrigger></TabsList></Tabs><div className="relative ml-auto w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tickets…" className="h-9 pl-9" /></div></div>
      {isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading live inbox…</div> : isError ? <div className="p-8 text-center"><p className="font-semibold">Could not load contact submissions</p><p className="mt-2 text-sm text-muted-foreground">Check the backend connection and admin session.</p></div> : filtered.length === 0 ? <EmptyState icon={LifeBuoy} title="Inbox zero" description="No website contacts match this filter right now." /> : <TableShell><thead><tr><Th>Message</Th><Th>Sender</Th><Th>Category</Th><Th>Priority</Th><Th>Status</Th><Th className="text-right">Updated</Th></tr></thead><tbody>{filtered.map((ticket) => <Tr key={ticket._id} onClick={() => setActive(ticket)}><Td><p className="font-semibold">{ticket.subject}</p><p className="text-xs text-muted-foreground">{ticket._id} · {ticket.messages.length} messages {ticket.repeatContact && "· Repeat contact"}</p></Td><Td>{requester(ticket)}</Td><Td className="text-muted-foreground">{ticket.category}</Td><Td><StatusPill label={ticket.priority} tone={priorityTone[ticket.priority]} /></Td><Td><StatusPill label={ticket.status} tone={statusTone[ticket.status]} /></Td><Td className="text-right text-muted-foreground">{new Date(ticket.updatedAt).toLocaleString()}</Td></Tr>)}</tbody></TableShell>}
    </Panel>
    <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}><SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg"><SheetHeader className="border-b border-border px-5 py-4"><SheetTitle>{active?.subject}</SheetTitle></SheetHeader>{active && <div className="space-y-5 p-5"><div className="flex flex-wrap gap-2"><StatusPill label={active.priority} tone={priorityTone[active.priority]} /><StatusPill label={active.status} tone={statusTone[active.status]} /><StatusPill label={active.category} tone="slate" /></div><div className="space-y-3"><p className="text-sm font-semibold">Conversation</p>{active.messages.map((message, index) => <div key={`${message.createdAt}-${index}`} className="rounded-xl border border-border bg-muted/40 p-3 text-sm"><p className="text-xs font-semibold">{message.sender?.name ?? requester(active)}</p><p className="mt-1 text-muted-foreground">{message.text}</p></div>)}</div><div className="space-y-2"><Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply…" rows={4} /><div className="flex gap-2"><Button className="btn-press gap-1.5" disabled={!reply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate()}>{replyMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send reply</Button><Button variant="outline" disabled={resolveMutation.isPending || active.status === "resolved"} onClick={() => resolveMutation.mutate()}>Mark resolved</Button></div></div></div>}</SheetContent></Sheet>
  </>;
}

function showError(error: unknown) { toast.error(error instanceof Error ? error.message : "Could not save the ticket"); }
