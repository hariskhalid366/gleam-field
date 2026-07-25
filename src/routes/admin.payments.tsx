import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Download, CreditCard, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, GlossyIcon, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money } from "@/components/admin/kit";
import { adminPayments, revenueSeries } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — ServicePro Admin" },
      { name: "description", content: "Transactions, invoices, refunds, commission and tax reporting for ServicePro." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Payments — ServicePro Admin" },
      { property: "og:description", content: "Transactions, refunds, commission and tax reporting." },
    ],
  }),
  component: PaymentsPage,
});

const tone = { paid: "emerald", pending: "amber", refunded: "blue", failed: "red" } as const;

function PaymentsPage() {
  const [q, setQ] = useState("");
  const rows = adminPayments.filter((p) => [p.id, p.customer, p.booking].join(" ").toLowerCase().includes(q.toLowerCase()));
  const gross = adminPayments.reduce((a, p) => a + p.amount, 0);
  const commission = adminPayments.reduce((a, p) => a + p.commission, 0);
  const tax = adminPayments.reduce((a, p) => a + p.tax, 0);
  const refunded = adminPayments.filter((p) => p.status === "refunded").reduce((a, p) => a + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Revenue health, settlements and refunds."
        crumbs={[{ label: "Payments" }]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Statement exported (demo)")}>
            <Download className="h-4 w-4" /> Export statement
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Gross volume", money(gross), "blue"],
          ["Commission earned", money(commission), "emerald"],
          ["Tax collected", money(tax), "amber"],
          ["Refunded", money(refunded), "red"],
        ].map(([label, value, t]) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <GlossyIcon icon={CreditCard} tone={t as "blue"} />
            <div>
              <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4">
        <Panel title="Revenue trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueSeries} margin={{ left: -18, right: 6 }}>
              <defs>
                <linearGradient id="pay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.17 155)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.68 0.17 155)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 255)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="oklch(0.52 0.02 255)" />
              <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 255)", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.68 0.17 155)" strokeWidth={2.5} fill="url(#pay)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel bodyClassName="p-0">
          <Tabs defaultValue="transactions">
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <TabsList>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="refunds">Refunds</TabsTrigger>
              </TabsList>
              <div className="relative ml-auto min-w-[200px] max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search payments" className="h-9 pl-9" />
              </div>
            </div>

            <TabsContent value="transactions" className="m-0">
              {rows.length === 0 ? (
                <EmptyState icon={CreditCard} title="No payments found" description="Payments appear here once a booking is completed and captured." />
              ) : (
                <TableShell>
                  <thead>
                    <tr>
                      <Th>Payment</Th><Th>Booking</Th><Th>Customer</Th><Th>Method</Th>
                      <Th className="text-right">Amount</Th><Th className="text-right">Commission</Th>
                      <Th className="text-right">Tax</Th><Th>Status</Th><Th>Date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <Tr key={p.id}>
                        <Td className="font-medium">{p.id}</Td>
                        <Td className="text-primary">{p.booking}</Td>
                        <Td>{p.customer}</Td>
                        <Td className="text-muted-foreground">{p.method}</Td>
                        <Td className="text-right font-semibold">{money(p.amount)}</Td>
                        <Td className="text-right">{money(p.commission)}</Td>
                        <Td className="text-right">{money(p.tax)}</Td>
                        <Td><StatusPill label={p.status} tone={tone[p.status]} /></Td>
                        <Td className="text-muted-foreground">{p.date}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </TableShell>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="m-0">
              <TableShell>
                <thead><tr><Th>Invoice</Th><Th>Customer</Th><Th className="text-right">Total</Th><Th>Status</Th><Th /></tr></thead>
                <tbody>
                  {adminPayments.slice(0, 8).map((p) => (
                    <Tr key={p.id}>
                      <Td className="font-medium">INV-{p.id.slice(4)}</Td>
                      <Td>{p.customer}</Td>
                      <Td className="text-right font-semibold">{money(p.amount + p.tax)}</Td>
                      <Td><StatusPill label={p.status} tone={tone[p.status]} /></Td>
                      <Td className="text-right"><Button size="sm" variant="ghost" onClick={() => toast.success("Invoice downloaded (demo)")}>Download</Button></Td>
                    </Tr>
                  ))}
                </tbody>
              </TableShell>
            </TabsContent>

            <TabsContent value="refunds" className="m-0">
              <TableShell>
                <thead><tr><Th>Payment</Th><Th>Customer</Th><Th className="text-right">Amount</Th><Th>Date</Th><Th /></tr></thead>
                <tbody>
                  {adminPayments.filter((p) => p.status === "refunded").map((p) => (
                    <Tr key={p.id}>
                      <Td className="font-medium">{p.id}</Td>
                      <Td>{p.customer}</Td>
                      <Td className="text-right font-semibold">{money(p.amount)}</Td>
                      <Td className="text-muted-foreground">{p.date}</Td>
                      <Td className="text-right">
                        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => toast.success("Refund re-issued (demo)")}>
                          <RefreshCcw className="h-3.5 w-3.5" /> Re-issue
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableShell>
            </TabsContent>
          </Tabs>
        </Panel>
      </div>
    </>
  );
}
