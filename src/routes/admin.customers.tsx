import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Users, Trash2, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money, num } from "@/components/admin/kit";
import { adminBookings, adminCustomers, adminReviews, type AdminCustomer } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — ServicePro Admin" },
      { name: "description", content: "Customer directory with booking history, spend, addresses and favourite technicians." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Customers — ServicePro Admin" },
      { property: "og:description", content: "Customer directory with booking history and spend." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<AdminCustomer | null>(null);
  const rows = adminCustomers.filter((c) => [c.name, c.city, c.email].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customers self-register on the public website — admin can only add accounts manually."
        crumbs={[{ label: "Customers" }]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("CSV export queued (demo)")}>
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" className="h-9 pl-9" />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet" description="Customers appear here as soon as they place their first booking on the website." />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Customer</Th><Th>Contact</Th><Th>City</Th>
                <Th className="text-right">Bookings</Th><Th className="text-right">Lifetime spend</Th>
                <Th>Joined</Th><Th>Status</Th><Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <Tr key={c.id} onClick={() => setActive(c)}>
                  <Td>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarImage src={c.avatar} alt={c.name} /><AvatarFallback>{c.name[0]}</AvatarFallback></Avatar>
                      <span className="font-medium">{c.name}</span>
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{c.email}</Td>
                  <Td>{c.city}</Td>
                  <Td className="text-right">{num(c.bookings)}</Td>
                  <Td className="text-right font-semibold">{money(c.spend)}</Td>
                  <Td className="text-muted-foreground">{c.joined}</Td>
                  <Td><StatusPill label={c.status} tone={c.status === "active" ? "emerald" : "amber"} /></Td>
                  <Td className="text-right"><Button size="sm" variant="ghost">View</Button></Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {active && (
            <>
              <SheetHeader><SheetTitle>Customer profile</SheetTitle></SheetHeader>
              <div className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14"><AvatarImage src={active.avatar} alt={active.name} /><AvatarFallback>{active.name[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-base font-semibold">{active.name}</p>
                    <p className="text-xs text-muted-foreground">{active.email} · {active.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["Bookings", num(active.bookings)], ["Spend", money(active.spend)], ["Since", active.joined.slice(0, 7)]].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-muted/60 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
                      <p className="text-sm font-semibold tabular-nums">{v}</p>
                    </div>
                  ))}
                </div>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent bookings</h3>
                  <ul className="space-y-2">
                    {adminBookings.filter((b) => b.customer === active.name).slice(0, 4).map((b) => (
                      <li key={b.id} className="flex items-center justify-between rounded-xl border border-border p-2.5 text-sm">
                        <span>{b.service}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{b.date} · {money(b.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Addresses</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">{active.addresses.map((a) => <li key={a}>{a}</li>)}</ul>
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Favourite technicians</h3>
                  <p className="text-sm text-muted-foreground">{active.favouriteTechs.join(" · ")}</p>
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviews left</h3>
                  <p className="text-sm text-muted-foreground">
                    {adminReviews.filter((r) => r.customer === active.name).length} reviews on file
                  </p>
                </section>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => toast.success("Customer suspended (demo)")}>
                    <PauseCircle className="h-4 w-4" /> Suspend
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-destructive" onClick={() => toast.success("Deletion requested (demo)")}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
