import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck, MapPin, Lock, HeadphonesIcon, Sparkles, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/why-us")({
  head: () => ({
    meta: [
      { title: "Why ServicePro — Enterprise-grade Field Service" },
      { name: "description", content: "The details that separate ServicePro from every other on-demand marketplace. Verified pros, live tracking, SLA-backed reliability." },
      { property: "og:title", content: "Why ServicePro — Enterprise-grade Field Service" },
      { property: "og:description", content: "Verified pros, live tracking, SLA-backed reliability." },
    ],
  }),
  component: WhyUsPage,
});

function WhyUsPage() {
  const values = [
    { icon: ShieldCheck, t: "Verified professionals", d: "Every pro is background-checked, license-verified, and $1M insured." },
    { icon: MapPin, t: "Real-time tracking", d: "Live GPS from dispatch to doorstep." },
    { icon: Lock, t: "Secure payments", d: "Cards authorized at booking, only charged on completion." },
    { icon: HeadphonesIcon, t: "24/7 support", d: "Real humans on call, every hour." },
    { icon: Sparkles, t: "Transparent pricing", d: "Starting rates upfront, written estimate on-site." },
    { icon: Award, t: "Warrantied work", d: "30-day workmanship warranty on every job." },
    { icon: Users, t: "Enterprise-ready", d: "Multi-site accounts, SLA reporting, invoicing." },
    { icon: Check, t: "Instant dispatch", d: "Average 42 min response in metro areas." },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="eyebrow">Why us</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-light tracking-tight sm:text-6xl">
        Enterprise-grade trust. <span className="font-semibold">Consumer-grade ease.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        We built ServicePro for the standards of a Fortune 500 facilities team,
        with an experience simple enough for a first-time homeowner.
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.t} className="card-elevated p-6">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"><v.icon className="h-5 w-5" strokeWidth={2.2} /></div>
            <h3 className="mt-5 text-lg font-semibold">{v.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-4">
        {[["500+", "Verified pros"], ["42", "Metros served"], ["4.9★", "Avg rating"], ["<60min", "Emergency ETA"]].map(([v, l]) => (
          <div key={l} className="card-elevated p-6 text-center">
            <p className="text-4xl font-bold">{v}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg"><Link to="/book">Book a technician</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
      </div>
    </div>
  );
}
