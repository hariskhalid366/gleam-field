import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, MessageCircle, Phone, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bookingStatuses, technicians } from "@/data/servicepro";
import mapImg from "@/assets/isometric-map.png";
import { cn } from "@/lib/utils";
import { api, apiConfigured } from "@/lib/api";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Your Booking — ServicePro" },
      { name: "description", content: "Real-time GPS tracking of your ServicePro technician from dispatch to doorstep." },
      { property: "og:title", content: "Track Your Booking — ServicePro" },
      { property: "og:description", content: "Real-time GPS tracking of your ServicePro technician." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { ref } = Route.useSearch();
  const [current, setCurrent] = useState(3);
  const tech = technicians[0];

  // Live status polling when the API is configured; demo progression otherwise.
  useEffect(() => {
    if (apiConfigured && ref) {
      let stop = false;
      const poll = async () => {
        try {
          const b = await api.bookings.detail(ref);
          const idx = bookingStatuses.findIndex((s) => s.key === b.status);
          if (!stop && idx >= 0) setCurrent(idx);
        } catch {
          /* keep last known state */
        }
      };
      poll();
      const t = setInterval(poll, 15000);
      return () => {
        stop = true;
        clearInterval(t);
      };
    }
    const t = setInterval(() => setCurrent((c) => Math.min(c + 1, bookingStatuses.length - 1)), 8000);
    return () => clearInterval(t);
  }, [ref]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Booking #SP-A9F32K</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">
        Your technician is <span className="font-semibold">on the way.</span>
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card-elevated overflow-hidden">
            <div className="relative h-72 bg-gradient-to-br from-primary-soft to-white">
              <img src={mapImg} alt="" className="absolute inset-0 h-full w-full object-contain" />
              <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow-elevated)] backdrop-blur">
                ETA · 12 min
              </div>
            </div>
          </div>

          <div className="card-elevated p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Status timeline</h3>
            <ol className="mt-5 space-y-4">
              {bookingStatuses.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <li key={s.key} className="flex items-start gap-4">
                    <div className={cn(
                      "relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all",
                      done && "bg-success text-success-foreground shadow-[var(--shadow-elevated)]",
                      active && "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]",
                      !done && !active && "border border-border bg-card text-muted-foreground",
                    )}>
                      {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                      {active && <span className="absolute inset-0 animate-ping rounded-xl bg-primary/40" />}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className={cn("text-sm font-semibold", !done && !active && "text-muted-foreground")}>{s.label}</p>
                      {active && <p className="text-xs text-muted-foreground">In progress · updated just now</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14"><AvatarImage src={tech.avatar} /><AvatarFallback>{tech.name[0]}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{tech.name}</p>
                <div className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-warning text-warning" /> {tech.rating} · {tech.completedJobs} jobs</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm"><MessageCircle className="mr-1 h-4 w-4" /> Chat</Button>
              <Button variant="outline" size="sm"><Phone className="mr-1 h-4 w-4" /> Call</Button>
            </div>
          </div>

          <div className="card-elevated p-6">
            <p className="eyebrow">Estimated arrival</p>
            <p className="mt-1 text-4xl font-bold">12 <span className="text-lg font-normal text-muted-foreground">min</span></p>
            <p className="mt-2 text-xs text-muted-foreground">Traffic is light on the route.</p>
          </div>

          <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
            <X className="mr-1 h-4 w-4" /> Cancel booking
          </Button>

          <Button asChild variant="link" className="w-full"><Link to="/">Back to home</Link></Button>
        </aside>
      </div>
    </div>
  );
}
