import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Search, Plus, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money } from "@/components/admin/kit";
import { adminBookings, bookingStatusMeta, serviceCatalog, type BookingStatus } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings/")({
  head: () => ({
    meta: [
      { title: "Bookings — ServicePro Admin" },
      { name: "description", content: "Search, filter and dispatch every ServicePro booking from one queue." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Bookings — ServicePro Admin" },
      { property: "og:description", content: "Search, filter and dispatch every ServicePro booking." },
    ],
  }),
  component: BookingsPage,
});

const PAGE = 8;

function BookingsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      adminBookings.filter(
        (b) =>
          (status === "all" || b.status === status) &&
          (service === "all" || b.service === service) &&
          (q === "" ||
            [b.id, b.customer, b.technician ?? "", b.service].join(" ").toLowerCase().includes(q.toLowerCase())),
      ),
    [q, status, service],
  );

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((page - 1) * PAGE, page * PAGE);
  const allChecked = view.length > 0 && view.every((r) => selected.includes(r.id));

  return (
    <>
      <PageHeader
        title="Bookings"
        description="All jobs originating from the public website and admin dispatch."
        crumbs={[{ label: "Bookings" }]}
        actions={
          <>
            <Button variant="outline" size="sm" className="btn-press gap-1.5" onClick={() => toast.success("Export queued (demo)")}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="btn-press gap-1.5" onClick={() => toast.success("Booking draft created (demo)")}>
              <Plus className="h-4 w-4" /> Create booking
            </Button>
          </>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by booking ID, customer, technician…"
              className="h-9 pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(bookingStatusMeta).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={service} onValueChange={(v) => { setService(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {serviceCatalog.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => { setQ(""); setStatus("all"); setService("all"); }}>
            <Filter className="h-4 w-4" /> Reset
          </Button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-2 text-sm animate-fade-in">
            <span className="font-medium">{selected.length} selected</span>
            <Button size="sm" variant="outline" onClick={() => toast.success(`${selected.length} bookings exported (demo)`)}>Bulk export</Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => { toast.success(`${selected.length} bookings cancelled (demo)`); setSelected([]); }}>Bulk cancel</Button>
          </div>
        )}

        {view.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings match these filters"
            description="Try widening the date range or clearing the status filter to see more jobs."
            action={<Button size="sm" onClick={() => { setQ(""); setStatus("all"); setService("all"); }}>Clear filters</Button>}
          />
        ) : (
          <>
            <TableShell>
              <thead>
                <tr>
                  <Th className="w-10">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(c) =>
                        setSelected(c ? Array.from(new Set([...selected, ...view.map((v) => v.id)])) : selected.filter((s) => !view.some((v) => v.id === s)))
                      }
                    />
                  </Th>
                  <Th>Booking</Th>
                  <Th>Customer</Th>
                  <Th>Technician</Th>
                  <Th>Service</Th>
                  <Th>Schedule</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {view.map((b) => (
                  <Tr key={b.id}>
                    <Td>
                      <Checkbox
                        checked={selected.includes(b.id)}
                        onCheckedChange={(c) => setSelected(c ? [...selected, b.id] : selected.filter((s) => s !== b.id))}
                      />
                    </Td>
                    <Td>
                      <Link to="/admin/bookings/$bookingId" params={{ bookingId: b.id }} className="font-semibold text-primary hover:underline">
                        {b.id}
                      </Link>
                      {b.priority === "emergency" && <StatusPill label="Emergency" tone="red" className="ml-2" />}
                    </Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={b.customerAvatar} alt={b.customer} /><AvatarFallback>{b.customer[0]}</AvatarFallback></Avatar>
                        <span className="truncate">{b.customer}</span>
                      </span>
                    </Td>
                    <Td className="text-muted-foreground">{b.technician ?? "Unassigned"}</Td>
                    <Td>{b.service}</Td>
                    <Td className="whitespace-nowrap text-muted-foreground">{b.date} · {b.time}</Td>
                    <Td className="text-right font-semibold">{money(b.amount)}</Td>
                    <Td><StatusPill {...bookingStatusMeta[b.status as BookingStatus]} /></Td>
                    <Td className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/admin/bookings/$bookingId" params={{ bookingId: b.id }}>Open</Link>
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableShell>

            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Showing <span className="font-medium tabular-nums text-foreground">{view.length}</span> of{" "}
                <span className="font-medium tabular-nums text-foreground">{rows.length}</span> bookings
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs tabular-nums text-muted-foreground">Page {page} / {pages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}
