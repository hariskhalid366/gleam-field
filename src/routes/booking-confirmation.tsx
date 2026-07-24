import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import badge from "@/assets/success-badge.png";

export const Route = createFileRoute("/booking-confirmation")({
  head: () => ({
    meta: [
      { title: "Booking Confirmed — ServicePro" },
      { name: "description", content: "Your booking is confirmed. Track your technician in real time." },
      { property: "og:title", content: "Booking Confirmed — ServicePro" },
      { property: "og:description", content: "Your booking is confirmed. Track your technician in real time." },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const id = "SP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
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
        <Info label="Booking ID" value={id} />
        <Info label="ETA" value="42 min" />
        <Info label="Technician" value="Marcus C." />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]"><Link to="/track">Track Booking</Link></Button>
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
