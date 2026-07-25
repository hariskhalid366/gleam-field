import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, MapPin, Printer, Download, UserCheck, XCircle, CalendarClock, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, StatusPill, money } from "@/components/admin/kit";
import { adminBookings, adminTechnicians, bookingStatusMeta, type BookingStatus } from "@/data/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bookings/$bookingId")({
  head: () => ({
    meta: [
      { title: "Booking detail — ServicePro Admin" },
      { name: "description", content: "Full booking record: customer, technician, pricing breakdown and status history." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Booking detail — ServicePro Admin" },
      { property: "og:description", content: "Full booking record with pricing breakdown and status history." },
    ],
  }),
  component: BookingDetail,
  errorComponent: () => <p className="text-sm text-muted-foreground">This booking failed to load.</p>,
  notFoundComponent: () => <p className="text-sm text-muted-foreground">Booking not found.</p>,
});

const flow: BookingStatus[] = ["pending", "assigned", "accepted", "travelling", "arrived", "working", "completed"];

function BookingDetail() {
  const { bookingId } = Route.useParams();
  const router = useRouter();
  const booking = adminBookings.find((b) => b.id === bookingId);
  const [status, setStatus] = useState<BookingStatus>(booking?.status ?? "pending");
  const [tech, setTech] = useState(booking?.technician ?? "");

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Booking {bookingId} doesn't exist.</p>
        <Button asChild className="mt-4" size="sm"><Link to="/admin/bookings">Back to bookings</Link></Button>
      </div>
    );
  }

  const total = booking.breakdown.reduce((a, b) => a + b.value, 0);
  const stepIndex = flow.indexOf(status);

  return (
    <>
      <PageHeader
        title={`${booking.service} · ${booking.id}`}
        description={`${booking.date} at ${booking.time} · ${booking.priority === "emergency" ? "Emergency dispatch" : "Standard dispatch"}`}
        crumbs={[{ label: "Bookings", to: "/admin/bookings" }, { label: booking.id }]}
        actions={
          <>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.history.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Invoice sent to printer (demo)")}>
              <Printer className="h-4 w-4" /> Print invoice
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Report downloaded (demo)")}>
              <Download className="h-4 w-4" /> Report
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive"><XCircle className="h-4 w-4" /> Cancel</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel this booking?</DialogTitle>
                  <DialogDescription>The customer will be notified and any authorization released.</DialogDescription>
                </DialogHeader>
                <Textarea placeholder="Cancellation reason (shared with the customer)" />
                <DialogFooter>
                  <Button variant="destructive" onClick={() => { setStatus("cancelled"); toast.success("Booking cancelled (demo)"); }}>
                    Cancel booking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Status" actions={<StatusPill {...bookingStatusMeta[status]} />}>
            <ol className="flex flex-wrap gap-y-4">
              {flow.map((s, i) => {
                const done = i <= stepIndex;
                return (
                  <li key={s} className="flex min-w-[92px] flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done ? "bg-primary" : "bg-border")} />
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-all",
                          done ? "bg-gradient-to-b from-[oklch(0.66_0.19_264)] to-[oklch(0.48_0.22_264)] text-white shadow-[0_4px_10px_-4px_oklch(0.4_0.2_264/0.7)]" : "border border-border bg-card text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className={cn("h-0.5 flex-1", i === flow.length - 1 ? "bg-transparent" : i < stepIndex ? "bg-primary" : "bg-border")} />
                    </div>
                    <span className={cn("mt-1.5 text-[11px] font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                      {bookingStatusMeta[s].label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Select value={status} onValueChange={(v) => { setStatus(v as BookingStatus); toast.success(`Status set to ${bookingStatusMeta[v as BookingStatus].label}`); }}>
                <SelectTrigger className="h-9 w-[190px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(bookingStatusMeta).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Reschedule request sent (demo)")}>
                <CalendarClock className="h-4 w-4" /> Reschedule
              </Button>
            </div>
          </Panel>

          <Panel title="Assignment">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={booking.technicianAvatar} alt={booking.technician ?? "Unassigned"} />
                <AvatarFallback>{(booking.technician ?? "U")[0]}</AvatarFallback>
              </Avatar>
              <div className="mr-auto">
                <p className="text-sm font-semibold">{tech || "Unassigned"}</p>
                <p className="text-xs text-muted-foreground">Only approved technicians can be assigned.</p>
              </div>
              <Select value={tech} onValueChange={(v) => { setTech(v); toast.success(`Assigned to ${v}`); }}>
                <SelectTrigger className="h-9 w-[220px]"><SelectValue placeholder="Assign technician" /></SelectTrigger>
                <SelectContent>
                  {adminTechnicians.filter((t) => t.status === "approved").map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name} · {t.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="gap-1.5" onClick={() => toast.success("Technician notified (demo)")}>
                <UserCheck className="h-4 w-4" /> Notify
              </Button>
            </div>
          </Panel>

          <Panel title="Uploaded images" description="Submitted by the customer at booking time.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid aspect-4/3 place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Notes: {booking.notes}</p>
          </Panel>

          <Panel title="Status history">
            <ol className="relative space-y-4 border-l border-border pl-4">
              {booking.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card" />
                  <p className="text-sm font-medium">{bookingStatusMeta[h.status].label}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">{h.at} · by {h.by}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Customer">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11"><AvatarImage src={booking.customerAvatar} alt={booking.customer} /><AvatarFallback>{booking.customer[0]}</AvatarFallback></Avatar>
              <div>
                <p className="text-sm font-semibold">{booking.customer}</p>
                <p className="text-xs text-muted-foreground">Booked via website</p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {booking.address}
            </p>
            <div className="mt-3 h-32 rounded-xl border border-border bg-[linear-gradient(135deg,oklch(0.95_0.02_255),oklch(0.90_0.03_264))] bg-cover" />
          </Panel>

          <Panel title="Price breakdown">
            <ul className="space-y-2 text-sm">
              {booking.breakdown.map((b) => (
                <li key={b.label} className="flex justify-between">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-medium tabular-nums">{money(b.value)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{money(total)}</span>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
