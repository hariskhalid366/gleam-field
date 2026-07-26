import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, ShieldCheck, KeyRound, Monitor, Smartphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — ServicePro Admin" },
      { name: "description", content: "Manage your admin account details, password, two-factor authentication and active sessions." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Profile — ServicePro Admin" },
      { property: "og:description", content: "Manage your admin account, password and sessions." },
    ],
  }),
  component: ProfilePage,
});

const sessions = [
  { device: "MacBook Pro · Chrome", location: "San Francisco, US", last: "Active now", icon: Monitor, current: true },
  { device: "iPhone 16 · Safari", location: "San Francisco, US", last: "2 hours ago", icon: Smartphone, current: false },
  { device: "Windows 11 · Edge", location: "Austin, US", last: "Yesterday", icon: Monitor, current: false },
];

function ProfilePage() {
  const [twoFa, setTwoFa] = useState(true);

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your personal admin account and security settings."
        crumbs={[{ label: "Profile" }]}
        actions={<Button size="sm" className="btn-press" onClick={() => toast.success("Profile saved (demo)")}>Save profile</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel>
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 shadow-[0_10px_30px_-12px_oklch(0.3_0.1_265/0.5)]">
                <AvatarImage src="https://i.pravatar.cc/160?u=dana" alt="Dana Whitmore" />
                <AvatarFallback>DW</AvatarFallback>
              </Avatar>
              <button
                onClick={() => toast.success("Avatar upload (demo)")}
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted"
                aria-label="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-lg font-semibold tracking-tight">Dana Whitmore</p>
            <p className="text-sm text-muted-foreground">dana@servicepro.io</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <StatusPill label="Owner" tone="violet" />
              <StatusPill label="2FA enabled" tone="emerald" />
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
            {[["Member since", "March 2023"], ["Last login", "Today · 08:12"], ["Actions this month", "1,284"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Panel title="Personal information">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Full name</label>
                  <Input defaultValue="Dana Whitmore" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Job title</label>
                  <Input defaultValue="Owner & Head of Operations" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Work email</label>
                  <Input defaultValue="dana@servicepro.io" type="email" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone</label>
                  <Input defaultValue="+1 (415) 555-0121" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Bio</label>
                  <Textarea rows={3} defaultValue="Running dispatch and field operations across 42 metros." />
                </div>
              </div>
            </Panel>
            <Panel title="Preferences">
              <div className="space-y-3">
                {[["Compact tables", "Denser rows across all list views"], ["Email digests", "Daily operations summary at 07:00"], ["Sound alerts", "Play a chime on urgent events"]].map(
                  ([label, hint], i) => (
                    <div key={label} className="flex items-center justify-between border-b border-border/70 py-2.5 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                      </div>
                      <Switch defaultChecked={i !== 2} />
                    </div>
                  ),
                )}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Panel title="Change password">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Current password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">New password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Confirm new password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button className="btn-press mt-4 gap-1.5" onClick={() => toast.success("Password updated (demo)")}>
                <KeyRound className="h-4 w-4" /> Update password
              </Button>
            </Panel>

            <Panel title="Two-factor authentication">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <GlossyIcon icon={ShieldCheck} tone={twoFa ? "emerald" : "slate"} />
                  <div>
                    <p className="text-sm font-medium">Authenticator app</p>
                    <p className="text-xs text-muted-foreground">
                      {twoFa ? "Enabled · required for owner accounts" : "Disabled — your role requires 2FA"}
                    </p>
                  </div>
                </div>
                <Switch checked={twoFa} onCheckedChange={(v) => { setTwoFa(v); toast.success(`2FA ${v ? "enabled" : "disabled"} (demo)`); }} />
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="sessions">
            <Panel title="Active sessions" description="Revoke anything you don't recognise.">
              <div className="space-y-2.5">
                {sessions.map((s) => (
                  <div key={s.device} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3.5">
                    <div className="flex items-center gap-3">
                      <GlossyIcon icon={s.icon} size="sm" tone={s.current ? "blue" : "slate"} />
                      <div>
                        <p className="text-sm font-medium">{s.device}</p>
                        <p className="text-xs text-muted-foreground">{s.location} · {s.last}</p>
                      </div>
                    </div>
                    {s.current ? (
                      <StatusPill label="This device" tone="emerald" />
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success("Session revoked (demo)")}>
                        <LogOut className="h-3.5 w-3.5" /> Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
