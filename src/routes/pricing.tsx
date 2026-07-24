import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/data/servicepro";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ServicePro" },
      { name: "description", content: "Simple, transparent pricing for one-off visits, emergencies, and annual maintenance plans." },
      { property: "og:title", content: "Pricing — ServicePro" },
      { property: "og:description", content: "Simple, transparent pricing." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
          Transparent, <span className="font-semibold">no surprises.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Pay per visit or lock in an annual plan. Cancel anytime.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((p) => (
          <div key={p.id} className={cn(
            "card-elevated relative flex flex-col p-8",
            p.recommended && "scale-[1.02] border-primary/30 shadow-[var(--shadow-floating)] lg:-translate-y-3",
          )}>
            {p.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)]">Recommended</span>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight">${p.price}</span>
              <span className="text-sm text-muted-foreground">/{p.cadence.replace("per ", "")}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>)}
            </ul>
            <Button asChild className="mt-8" variant={p.recommended ? "default" : "outline"}>
              <Link to="/book">Get started</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
