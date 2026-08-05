import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services as offlineServices } from "@/data/servicepro";
import { cn } from "@/lib/utils";
import { api, apiConfigured } from "@/lib/api";
import { toDisplayService } from "@/lib/service-display";

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
  const { data: services, isLoading, isError } = useQuery({
    queryKey: ["services"],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: () => api.services.list(),
  });
  const listings = services
    ? services.map((service) => ({ ...toDisplayService(service), included: service.included ?? [] }))
    : apiConfigured
      ? []
      : offlineServices.map((service) => ({ ...service, included: [] }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
          Transparent, <span className="font-semibold">no surprises.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Starting prices come directly from our live service catalog. Your final estimate is confirmed before work begins.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {isLoading && <div className="col-span-full flex justify-center py-16 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading live pricing…</div>}
        {isError && <div className="col-span-full card-elevated p-8 text-center"><p className="font-semibold">Pricing is temporarily unavailable</p><p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p></div>}
        {!isLoading && !isError && listings.map((p) => (
          <div key={p.slug} className={cn(
            "card-elevated relative flex flex-col p-8",
            "border-primary/10",
          )}>
            <p className="eyebrow">{p.category ?? "Service"}</p>
            <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight">${p.startingPrice}</span>
              <span className="text-sm text-muted-foreground">starting price</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />Estimated duration: {p.eta}</li>
              {(p.included ?? []).slice(0, 3).map((item) => <li key={item} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{item}</li>)}
            </ul>
            <Button asChild className="mt-8">
              <Link to="/book" search={{ service: p.slug }}>Book this service</Link>
            </Button>
          </div>
        ))}
        {!isLoading && !isError && listings.length === 0 && <div className="col-span-full card-elevated p-8 text-center text-muted-foreground">No services are currently listed.</div>}
      </div>
    </div>
  );
}
