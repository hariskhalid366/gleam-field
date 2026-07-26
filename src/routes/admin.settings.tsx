import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, ShieldCheck, Bell, CreditCard, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlossyIcon, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr } from "@/components/admin/kit";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ServicePro Admin" },
      { name: "description", content: "Business profile, roles and permissions, payouts, notifications and integrations." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings — ServicePro Admin" },
      { property: "og:description", content: "Business profile, roles, payouts and integrations." },
    ],
  }),
  component: SettingsPage,
});

const roles = [
  { role: "Owner", members: 1, scope: "Full access including billing and roles", tone: "violet" as const },
  { role: "Operations Manager", members: 3, scope: "Bookings, dispatch, technicians, verification", tone: "blue" as const },
  { role: "Support Agent", members: 6, scope: "Tickets, customer records, review moderation", tone: "amber" as const },
  { role: "Finance", members: 2, scope: "Payments, refunds, payouts, reports", tone: "emerald" as const },
  { role: "Read-only Auditor", members: 1, scope: "View-only access to all modules", tone: "slate" as const },
];

const integrations = [
  { name: "Stripe", desc: "Card payments, refunds and technician payouts", on: true },
  { name: "Twilio", desc: "SMS booking updates and OTP verification", on: true },
  { name: "SendGrid", desc: "Transactional email delivery", on: true },
  { name: "Google Maps", desc: "Geocoding, routing and live technician tracking", on: true },
  { name: "Slack", desc: "Operational alerts to the #dispatch channel", on: false },
  { name: "QuickBooks", desc: "Accounting sync for invoices and payouts", on: false },
];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 py-3.5 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="w-full max-w-xs">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const [ints, setInts] = useState(integrations);
  const [notif, setNotif] = useState({ bookings: true, approvals: true, payments: true, weekly: false });

  return (
    <>
      <PageHeader
        title="Settings"
        description="Business configuration, access control and connected services."
        crumbs={[{ label: "Settings" }]}
        actions={<Button size="sm" className="btn-press" onClick={() => toast.success("Settings saved (demo)")}>Save changes</Button>}
      />

      <Tabs defaultValue="business">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
          <TabsTrigger value="payments">Payments & payouts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Panel title="Business profile">
              <Row label="Legal name"><Input defaultValue="ServicePro Field Services Inc." /></Row>
              <Row label="Support email"><Input defaultValue="support@servicepro.io" /></Row>
              <Row label="Support phone"><Input defaultValue="+1 (415) 555-0198" /></Row>
              <Row label="Default currency">
                <Select defaultValue="usd">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD — US Dollar</SelectItem>
                    <SelectItem value="eur">EUR — Euro</SelectItem>
                    <SelectItem value="gbp">GBP — Pound Sterling</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Timezone">
                <Select defaultValue="pt">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">America/Los_Angeles</SelectItem>
                    <SelectItem value="et">America/New_York</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Public description" hint="Shown in the website footer.">
                <Textarea rows={3} defaultValue="Verified field service professionals, dispatched in under 45 minutes." />
              </Row>
            </Panel>

            <Panel title="Service coverage">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <GlossyIcon icon={Building2} />
                  <div>
                    <p className="text-xl font-semibold tracking-tight">42</p>
                    <p className="text-xs text-muted-foreground">Metro areas served</p>
                  </div>
                </div>
                <Row label="Emergency dispatch" hint="24/7 priority routing"><div className="flex justify-end"><Switch defaultChecked /></div></Row>
                <Row label="Auto-assign bookings" hint="Nearest available verified tech"><div className="flex justify-end"><Switch defaultChecked /></div></Row>
                <Row label="Accept new signups" hint="Technician applications open"><div className="flex justify-end"><Switch defaultChecked /></div></Row>
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <Panel title="Roles & permissions" description="Access is enforced server-side per role." bodyClassName="p-0"
            actions={<Button size="sm" variant="outline" onClick={() => toast.success("Invite sent (demo)")}>Invite member</Button>}>
            <TableShell>
              <thead><tr><Th>Role</Th><Th>Members</Th><Th>Scope</Th><Th className="text-right">Manage</Th></tr></thead>
              <tbody>
                {roles.map((r) => (
                  <Tr key={r.role}>
                    <Td><StatusPill label={r.role} tone={r.tone} /></Td>
                    <Td className="font-semibold">{r.members}</Td>
                    <Td className="text-muted-foreground">{r.scope}</Td>
                    <Td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => toast.success(`Editing ${r.role} (demo)`)}>Edit</Button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableShell>
          </Panel>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Commission & fees">
              <Row label="Platform commission"><Input defaultValue="18%" /></Row>
              <Row label="Emergency surcharge"><Input defaultValue="35%" /></Row>
              <Row label="Cancellation fee"><Input defaultValue="$25" /></Row>
              <Row label="Tax rate"><Input defaultValue="8.5%" /></Row>
            </Panel>
            <Panel title="Payout schedule">
              <Row label="Frequency">
                <Select defaultValue="weekly">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly (Friday)</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Minimum payout"><Input defaultValue="$50" /></Row>
              <Row label="Hold period" hint="Days after job completion"><Input defaultValue="2" /></Row>
              <Row label="Instant payout" hint="1.5% fee to technician"><div className="flex justify-end"><Switch defaultChecked /></div></Row>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Panel title="Admin notification preferences">
            {([
              ["bookings", "Booking updates", "New, reassigned and cancelled jobs"],
              ["approvals", "Verification approvals", "Technician documents submitted or expiring"],
              ["payments", "Payment events", "Failed charges, refunds and payout runs"],
              ["weekly", "Weekly digest", "Monday morning performance summary"],
            ] as const).map(([key, label, hint]) => (
              <Row key={key} label={label} hint={hint}>
                <div className="flex justify-end">
                  <Switch checked={notif[key]} onCheckedChange={(v) => setNotif((n) => ({ ...n, [key]: v }))} />
                </div>
              </Row>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Authentication">
              <Row label="Two-factor authentication" hint="Required for all admin roles"><div className="flex justify-end"><Switch defaultChecked /></div></Row>
              <Row label="Session timeout"><Input defaultValue="30 minutes" /></Row>
              <Row label="Password rotation"><Input defaultValue="90 days" /></Row>
              <Row label="Allowed IP ranges" hint="Leave blank to allow all"><Input placeholder="203.0.113.0/24" /></Row>
            </Panel>
            <Panel title="Audit trail">
              <div className="space-y-2.5 text-sm">
                {[
                  ["Dana Whitmore", "changed commission rate", "10:14"],
                  ["Ken Osei", "exported payments report", "09:47"],
                  ["Marta Silva", "revoked agent access", "Yesterday"],
                  ["System", "rotated API credentials", "2 days ago"],
                ].map(([who, what, when]) => (
                  <div key={what} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                    <span><span className="font-semibold">{who}</span> <span className="text-muted-foreground">{what}</span></span>
                    <span className="text-xs text-muted-foreground">{when}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ints.map((i) => (
              <Panel key={i.name}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GlossyIcon icon={i.name === "Stripe" ? CreditCard : i.name === "Slack" ? Bell : Plug} tone={i.on ? "blue" : "slate"} />
                    <div>
                      <p className="text-sm font-semibold">{i.name}</p>
                      <StatusPill label={i.on ? "Connected" : "Not connected"} tone={i.on ? "emerald" : "slate"} />
                    </div>
                  </div>
                  <Switch
                    checked={i.on}
                    onCheckedChange={(v) => { setInts((xs) => xs.map((x) => (x.name === i.name ? { ...x, on: v } : x))); toast.success(`${i.name} ${v ? "connected" : "disconnected"} (demo)`); }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{i.desc}</p>
              </Panel>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Panel className="mt-4" title="Team access summary">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Admin users", value: 13, icon: Users },
            { label: "2FA enrolled", value: "13 / 13", icon: ShieldCheck },
            { label: "Open invites", value: 2, icon: Bell },
          ].map((s) => (
            <div key={s.label} className="flex min-w-[180px] items-center gap-3 rounded-xl border border-border p-3">
              <GlossyIcon icon={s.icon} size="sm" />
              <div>
                <p className="text-sm font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
