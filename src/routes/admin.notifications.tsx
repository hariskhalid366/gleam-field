import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Send, Check, CalendarCheck, ShieldCheck, CreditCard, LifeBuoy, ServerCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { adminNotifications, type AdminNotification, type Tone } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — ServicePro Admin" },
      { name: "description", content: "Notification center and broadcast composer for customers and technicians." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Notifications — ServicePro Admin" },
      { property: "og:description", content: "Notification center and broadcast composer." },
    ],
  }),
  component: NotificationsPage,
});

const catMeta: Record<AdminNotification["category"], { tone: Tone; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  "Booking Updates": { tone: "blue", icon: CalendarCheck },
  Approvals: { tone: "violet", icon: ShieldCheck },
  Support: { tone: "amber", icon: LifeBuoy },
  Payments: { tone: "emerald", icon: CreditCard },
  "System Alerts": { tone: "slate", icon: ServerCog },
};

function NotificationsPage() {
  const [items, setItems] = useState(adminNotifications);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all-customers");
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });

  const unread = items.filter((n) => !n.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="System events plus outbound broadcasts to customers and technicians."
        crumbs={[{ label: "Notifications" }]}
        actions={
          <Button size="sm" variant="outline" onClick={() => { setItems((i) => i.map((n) => ({ ...n, read: true }))); toast.success("All marked read"); }}>
            <Check className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel bodyClassName="p-0">
          <Tabs defaultValue="unread" className="p-4">
            <TabsList>
              <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            </TabsList>
            {(["unread", "all"] as const).map((tab) => {
              const list = tab === "unread" ? unread : items;
              return (
                <TabsContent key={tab} value={tab} className="mt-4 space-y-2">
                  {list.length === 0 ? (
                    <EmptyState icon={Bell} title="You're all caught up" description="New system events will appear here in real time." />
                  ) : (
                    list.map((n) => {
                      const meta = catMeta[n.category];
                      return (
                        <div key={n.id} className="flex gap-3 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/40">
                          <GlossyIcon icon={meta.icon} tone={meta.tone} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold">{n.title}</p>
                              <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <StatusPill label={n.category} tone={meta.tone} />
                              {!n.read && (
                                <button
                                  className="text-[11px] font-semibold text-primary hover:underline"
                                  onClick={() => setItems((i) => i.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </Panel>

        <div className="space-y-4">
          <Panel title="Send a broadcast" description="Reaches the selected audience across enabled channels.">
            <div className="space-y-3">
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customers">All customers</SelectItem>
                  <SelectItem value="all-technicians">All technicians</SelectItem>
                  <SelectItem value="pending-verification">Technicians pending verification</SelectItem>
                  <SelectItem value="vip">VIP customers</SelectItem>
                </SelectContent>
              </Select>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" />
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Message body…" />
              <div className="space-y-2 rounded-xl border border-border p-3">
                {([["push", "Push notification"], ["email", "Email"], ["sms", "SMS"]] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <Switch
                      checked={channels[key]}
                      onCheckedChange={(v) => setChannels((c) => ({ ...c, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
              <Button
                className="btn-press w-full gap-1.5"
                disabled={!title.trim() || !body.trim()}
                onClick={() => { setTitle(""); setBody(""); toast.success("Broadcast queued (demo)"); }}
              >
                <Send className="h-4 w-4" /> Send broadcast
              </Button>
            </div>
          </Panel>

          <Panel title="Delivery health">
            <div className="space-y-2.5 text-sm">
              {[["Push delivery", "99.2%", "emerald"], ["Email delivery", "98.4%", "emerald"], ["SMS delivery", "94.1%", "amber"]].map(
                ([k, v, tone]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <StatusPill label={v} tone={tone as Tone} />
                  </div>
                ),
              )}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
