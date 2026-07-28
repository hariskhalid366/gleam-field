import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarCheck, Wrench, ShieldCheck, Users, Layers, Calendar, CreditCard,
  Star, LifeBuoy, Bell, BarChart3, FileText, Settings, UserCircle, LogOut, Search,
  PanelLeftClose, PanelLeftOpen, Plus, Zap, ChevronDown, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, apiConfigured, tokenStore } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  adminBookings, adminCustomers, adminNotifications, adminTechnicians, serviceCatalog,
  pendingVerificationCount,
} from "@/data/admin";
import { StatusPill } from "./kit";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; exact?: boolean; badge?: number };

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/technicians", label: "Technicians", icon: Wrench },
  { to: "/admin/verification", label: "Verification Queue", icon: ShieldCheck, badge: pendingVerificationCount },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/services", label: "Services", icon: Layers },
  { to: "/admin/calendar", label: "Calendar", icon: Calendar },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/cms", label: "CMS", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmd((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unread = adminNotifications.filter((n) => !n.read && !read.includes(n.id));

  const go = (to: string) => {
    setCmd(false);
    navigate({ to });
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-screen bg-surface text-foreground">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card transition-[width] duration-300 md:flex",
            collapsed ? "w-[68px]" : "w-64",
          )}
        >
          <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-0")}>
            <Link to="/admin" className="flex items-center gap-2 overflow-hidden">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[oklch(0.66_0.19_264)] to-[oklch(0.48_0.22_264)] text-white shadow-[0_6px_16px_-6px_oklch(0.4_0.2_264/0.6)]">
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              {!collapsed && (
                <span className="whitespace-nowrap text-sm font-bold tracking-tight">
                  ServicePro <span className="font-medium text-muted-foreground">Admin</span>
                </span>
              )}
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const link = (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge ? (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                  {collapsed && item.badge ? (
                    <span className="absolute ml-6 -mt-5 h-2 w-2 rounded-full bg-destructive" />
                  ) : null}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })}
          </nav>

          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={async () => {
                if (apiConfigured) await api.auth.logout().catch(() => undefined);
                tokenStore.clear();
                navigate({ to: "/admin-login", replace: true });
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!collapsed && "Logout"}
            </button>
          </div>

        </aside>

        {/* Main column */}
        <div className={cn("transition-[padding] duration-300", collapsed ? "md:pl-[68px]" : "md:pl-64")}>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-xl sm:px-6">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <button
              onClick={() => setCmd(true)}
              className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Search bookings, technicians, customers…</span>
              <kbd className="ml-auto hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium sm:block">⌘K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="btn-press hidden gap-1.5 sm:inline-flex">
                    <Plus className="h-4 w-4" /> Quick action <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => go("/admin/verification")}>Approve Technician</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/admin/bookings")}>Create Booking</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/admin/technicians")}>Add Technician</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/admin/notifications")}>Send Notification</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="relative" onClick={() => setDrawer(true)} aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                {unread.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread.length}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://i.pravatar.cc/80?u=dana" alt="Dana Whitmore" />
                      <AvatarFallback>DW</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-left text-xs leading-tight lg:block">
                      <span className="block font-semibold">Dana Whitmore</span>
                      <span className="block text-muted-foreground">Owner</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>dana@servicepro.io</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => go("/admin/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/admin/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => go("/admin-login")}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
            {nav.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                  pathname === i.to ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                {i.label}
              </Link>
            ))}
          </div>

          <main key={pathname} className="animate-fade-in p-4 sm:p-6 lg:p-8">{children}</main>
        </div>

        {/* Notification drawer */}
        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle>Notification Center</SheetTitle>
            </SheetHeader>
            <Tabs defaultValue="unread" className="px-5 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="unread" className="flex-1">Unread ({unread.length})</TabsTrigger>
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              </TabsList>
              {(["unread", "all"] as const).map((tab) => {
                const list = tab === "unread" ? unread : adminNotifications;
                return (
                  <TabsContent key={tab} value={tab} className="max-h-[70vh] space-y-2 overflow-y-auto py-4">
                    {list.length === 0 && (
                      <p className="py-10 text-center text-sm text-muted-foreground">You're all caught up.</p>
                    )}
                    {list.map((n) => (
                      <div key={n.id} className="rounded-xl border border-border p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{n.title}</p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <StatusPill label={n.category} tone="slate" />
                          {!n.read && !read.includes(n.id) && (
                            <button
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                              onClick={() => setRead((r) => [...r, n.id])}
                            >
                              <Check className="h-3 w-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                );
              })}
            </Tabs>
          </SheetContent>
        </Sheet>

        {/* Global search */}
        <CommandDialog open={cmd} onOpenChange={setCmd}>
          <CommandInput placeholder="Search across ServicePro…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Bookings">
              {adminBookings.slice(0, 5).map((b) => (
                <CommandItem key={b.id} onSelect={() => go("/admin/bookings")}>
                  <CalendarCheck className="mr-2 h-4 w-4" /> {b.id} · {b.service} · {b.customer}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Technicians">
              {adminTechnicians.slice(0, 5).map((t) => (
                <CommandItem key={t.id} onSelect={() => go("/admin/technicians")}>
                  <Wrench className="mr-2 h-4 w-4" /> {t.name} · {t.city}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Customers">
              {adminCustomers.slice(0, 4).map((c) => (
                <CommandItem key={c.id} onSelect={() => go("/admin/customers")}>
                  <Users className="mr-2 h-4 w-4" /> {c.name} · {c.city}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Services">
              {serviceCatalog.slice(0, 4).map((s) => (
                <CommandItem key={s.id} onSelect={() => go("/admin/services")}>
                  <Layers className="mr-2 h-4 w-4" /> {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => { setCmd(false); toast.success("Opened roles & permissions"); navigate({ to: "/admin/settings" }); }}>
                <Settings className="mr-2 h-4 w-4" /> Roles & permissions
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProvider>
  );
}
