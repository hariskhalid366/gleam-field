import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { services } from "@/data/servicepro";
import { api, apiConfigured } from "@/lib/api";
import { toDisplayService } from "@/lib/service-display";

export const Route = createFileRoute("/services/$slug")({
  head: () => ({
    meta: [
      { title: "Service details — ServicePro" },
      {
        name: "description",
        content: "Service details, transparent pricing, and verified technician coverage.",
      },
    ],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const fallback = services.find((item) => item.slug === slug);
  const { data: liveService, isLoading } = useQuery({
    queryKey: ["service", slug],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: () => api.services.detailBySlug(slug).catch(() => undefined),
  });
  const service = liveService ? toDisplayService(liveService) : fallback;

  if (!service && isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">
        Loading service…
      </div>
    );
  }
  if (!service) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="text-3xl font-semibold">Service not found</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/services">Browse services</Link>
        </Button>
      </div>
    );
  }

  const included = liveService?.included?.length
    ? liveService.included
    : [
        "Diagnostic and written estimate before work begins",
        "Verified, insured technician",
        "All standard parts and materials",
        "Clean-up and haul-away",
        "30-day workmanship warranty",
      ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/services">
          <ArrowLeft className="mr-1 h-4 w-4" /> All services
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="card-elevated grid place-items-center bg-gradient-to-br from-primary-soft to-white p-16">
          <img
            src={service.icon}
            alt={service.title}
            className="max-h-80 w-auto drop-shadow-[0_30px_40px_rgba(37,99,235,0.25)]"
          />
        </div>
        <div>
          <Badge variant="secondary" className="rounded-full">
            {service.category}
          </Badge>
          <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">{service.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{service.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="card-elevated p-4">
              <p className="eyebrow">Starting</p>
              <p className="mt-1 text-2xl font-bold">${service.startingPrice}</p>
            </div>
            <div className="card-elevated p-4">
              <p className="eyebrow">Typical ETA</p>
              <p className="mt-1 text-2xl font-bold">{service.eta}</p>
            </div>
          </div>

          <ul className="mt-8 space-y-2 text-sm">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]">
              <Link to="/book" search={{ service: service.slug }}>
                Book Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/technicians">Browse Technicians</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Insured
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Real-time tracking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
