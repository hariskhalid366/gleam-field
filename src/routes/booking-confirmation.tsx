import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import badge from "@/assets/success-badge.png";

type ConfirmationSearch = { ref?: string; id?: string; service?: string };

export const Route = createFileRoute("/booking-confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmationSearch => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
    id: typeof search.id === "string" ? search.id : undefined,
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Booking Confirmed — ServicePro" },
      { name: "description", content: "Your booking is confirmed. Track your technician in real time." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Booking Confirmed — ServicePro" },
      { property: "og:description", content: "Your booking is confirmed. Track your technician in real time." },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { ref, id, service } = Route.useSearch();
  const displayRef = ref ?? "SP-DEMO01";
  return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
      <img src={badge} alt="" className="h-40 w-40 drop-shadow-[0_30px_40px_rgba(16,185,129,0.35)] animate-scale-in" />
      <h1 className="mt-8 text-5xl font-light tracking-tight sm:text-6xl">
        You're all <span className="font-semibold">set.</span>
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        We've dispatched a verified technician to your address. You'll get
        live tracking, an ETA, and status updates in the app.
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
        <Info label="Booking ID" value={displayRef} />
        <Info label="Service" value={service || "Field service"} />
        <Info label="ETA" value="42 min" />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]">
          <Link to="/track" search={{ ref: displayRef, id }}>Track Booking</Link>
        </Button>
        <Button asChild size="lg" variant="outline"><Link to="/">Return Home</Link></Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-elevated p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
