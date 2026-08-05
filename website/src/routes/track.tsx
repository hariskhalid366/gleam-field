import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, MessageCircle, Phone, X, Star, LoaderCircle, UserRound, MapPin, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { bookingStatuses, technicians } from "@/data/servicepro";
import mapImg from "@/assets/isometric-map.png";
import { cn } from "@/lib/utils";
import { api, apiConfigured, isAuthenticated, startSession, userStore, type BookingTracking } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): { ref?: string; id?: string } => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({ meta: [{ title: "Track Your Booking — ServicePro" }, { name: "robots", content: "noindex" }] }),
  component: TrackPage,
});

const avatarFor = (name: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
const statusLabel = (status: string) => status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function TrackPage() {
  const { ref, id } = Route.useSearch();
  const [booking, setBooking] = useState<BookingTracking | null>(null);
  const [signedIn, setSignedIn] = useState(() => isAuthenticated() && userStore.get()?.role === "customer");
  const [signInOpen, setSignInOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiConfigured || !signedIn || !id) return;
    let active = true;
    const poll = async () => {
      try {
        const liveBooking = await api.bookings.detail(id);
        if (active) { setBooking(liveBooking); setLoadError(null); }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load this booking");
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [id, signedIn]);

  if (apiConfigured && !signedIn) {
    return <TrackingSignIn onSignIn={() => setSignedIn(true)} open={signInOpen} onOpenChange={setSignInOpen} />;
  }
  if (apiConfigured && !id) {
    return <StateCard title="Booking link incomplete" description="Open tracking from your booking confirmation or use the link sent to your account." />;
  }
  if (apiConfigured && loadError) {
    return <StateCard title="Booking unavailable" description={loadError} />;
  }
  if (apiConfigured && !booking) {
    return <div className="mx-auto grid min-h-[60vh] place-items-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading your booking…</div>;
  }

  return apiConfigured && booking ? <LiveTracking booking={booking} onCancelled={(note) => setBooking((current) => current ? ({ ...current, status: "cancelled", timeline: [...current.timeline, { status: "cancelled", at: new Date().toISOString(), note }] }) : current)} /> : <OfflineTracking ref={ref} />;
}

function LiveTracking({ booking, onCancelled }: { booking: BookingTracking; onCancelled: (note?: string) => void }) {
  const customerName = booking.customer.name;
  const technicianName = booking.technician?.user?.name ?? "Awaiting dispatch";
  const scheduled = new Date(booking.scheduledFor).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Booking #{booking.reference}</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Status: <span className="font-semibold">{statusLabel(booking.status)}.</span></h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card-elevated overflow-hidden"><div className="relative h-72 bg-gradient-to-br from-primary-soft to-white"><img src={mapImg} alt="Service location map" className="absolute inset-0 h-full w-full object-contain" /><div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow-elevated)]">{booking.address.city}</div></div></div>
          <div className="card-elevated p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Live booking timeline</h3>
            <ol className="mt-5 space-y-4">
              {booking.timeline.map((event, index) => <li key={`${event.status}-${event.at}`} className="flex items-start gap-4"><div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", index === booking.timeline.length - 1 ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground")}><Check className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{statusLabel(event.status)}</p><p className="text-xs text-muted-foreground">{new Date(event.at).toLocaleString()}{event.note ? ` · ${event.note}` : ""}</p></div></li>)}
            </ol>
          </div>
        </div>
        <aside className="space-y-4">
          <PersonCard label="Your account" name={customerName} email={booking.customer.email} avatar={booking.customer.avatarUrl} />
          <PersonCard label="Assigned technician" name={technicianName} email={booking.technician?.user?.email} avatar={booking.technician?.user?.avatarUrl} rating={booking.technician?.rating} jobs={booking.technician?.jobsCompleted} />
          <div className="card-elevated space-y-3 p-6"><p className="eyebrow">Booking details</p><p className="font-semibold">{booking.service?.name ?? "Service"}</p><p className="flex gap-2 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4 shrink-0" /> {scheduled}</p><p className="flex gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /> {booking.address.line1}, {booking.address.city}</p><p className="border-t border-border pt-3 text-lg font-bold">{booking.price.currency} ${booking.price.total}</p></div>
          <CancelBooking booking={booking} onCancelled={onCancelled} />
          <Button asChild variant="link" className="w-full"><Link to="/">Back to home</Link></Button>
        </aside>
      </div>
    </div>
  );
}

function CancelBooking({ booking, onCancelled }: { booking: BookingTracking; onCancelled: (note?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const canCancel = !["in_progress", "completed", "cancelled", "disputed"].includes(booking.status);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (confirmation.trim().toUpperCase() !== "YES") return;
    setCancelling(true);
    try {
      await api.bookings.cancel(booking._id, "Cancelled by customer");
      onCancelled("Cancelled by customer");
      toast.success("Booking cancelled");
      setOpen(false);
      setConfirmation("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel this booking");
    } finally {
      setCancelling(false);
    }
  };
  return <><Button variant="ghost" disabled={!canCancel} className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpen(true)}><X className="mr-1 h-4 w-4" /> {canCancel ? "Cancel booking" : "Cancellation unavailable"}</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Cancel this booking?</DialogTitle><DialogDescription>This action notifies dispatch and cannot be undone online. Type <strong>YES</strong> to confirm.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type YES to cancel" disabled={cancelling} /><Button variant="destructive" className="w-full" disabled={confirmation.trim().toUpperCase() !== "YES" || cancelling}>{cancelling ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Cancelling…</> : "Cancel booking"}</Button></form></DialogContent></Dialog></>;
}

function PersonCard({ label, name, email, avatar, rating, jobs }: { label: string; name: string; email?: string; avatar?: string; rating?: number; jobs?: number }) {
  return <div className="card-elevated p-6"><p className="eyebrow">{label}</p><div className="mt-3 flex items-center gap-3"><Avatar className="h-14 w-14"><AvatarImage src={avatar ?? avatarFor(name)} alt={name} /><AvatarFallback><UserRound className="h-5 w-5" /></AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-semibold">{name}</p>{email && <p className="truncate text-xs text-muted-foreground">{email}</p>}{rating !== undefined && <p className="mt-1 flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-warning text-warning" /> {rating} · {jobs?.toLocaleString() ?? 0} jobs</p>}</div></div>{label === "Assigned technician" && name !== "Awaiting dispatch" && <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" size="sm"><MessageCircle className="mr-1 h-4 w-4" /> Chat</Button><Button variant="outline" size="sm"><Phone className="mr-1 h-4 w-4" /> Call</Button></div>}</div>;
}

function TrackingSignIn({ open, onOpenChange, onSignIn }: { open: boolean; onOpenChange: (open: boolean) => void; onSignIn: () => void }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); try { const result = await api.auth.login(email, password); if (result.user.role !== "customer") throw new Error("Please sign in with the customer account that created this booking."); startSession(result); toast.success("Signed in securely"); onOpenChange(false); onSignIn(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not sign in"); } finally { setLoading(false); } };
  return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-12 text-center"><div className="card-elevated p-8"><p className="eyebrow">Private booking tracking</p><h1 className="mt-3 text-3xl font-semibold">Sign in to track your booking</h1><p className="mt-3 text-sm text-muted-foreground">Only the customer who created this booking can view its status and technician details.</p><Button className="mt-6" onClick={() => onOpenChange(true)}>Sign in</Button></div><Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Sign in to track</DialogTitle><DialogDescription>Use the customer account that placed this booking.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div><label className="mb-1.5 block text-sm font-medium">Email</label><Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><label className="mb-1.5 block text-sm font-medium">Password</label><Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div><Button className="w-full" disabled={loading}>{loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign in & track booking"}</Button></form></DialogContent></Dialog></div>;
}

function OfflineTracking({ ref }: { ref?: string }) { const tech = technicians[0]!; return <div className="mx-auto max-w-4xl px-4 py-16"><p className="eyebrow">Booking #{ref ?? "SP-DEMO01"}</p><h1 className="mt-3 text-4xl font-light">Demo tracking preview</h1><PersonCard label="Your account" name="Demo customer" email="customer@example.com" /><PersonCard label="Assigned technician" name={tech.name} avatar={tech.avatar} rating={tech.rating} jobs={tech.completedJobs} /></div>; }
function StateCard({ title, description }: { title: string; description: string }) { return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 text-center"><div className="card-elevated p-8"><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm text-muted-foreground">{description}</p><Button asChild variant="outline" className="mt-6"><Link to="/">Back to home</Link></Button></div></div>; }
