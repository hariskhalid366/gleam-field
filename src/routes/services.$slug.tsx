import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { services } from "@/data/servicepro";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.service.title} — ServicePro` },
          { name: "description", content: loaderData.service.description },
          { property: "og:title", content: `${loaderData.service.title} — ServicePro` },
          { property: "og:description", content: loaderData.service.description },
        ]
      : [{ title: "Service not found — ServicePro" }, { name: "robots", content: "noindex" }],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const included = [
    "Diagnostic and written estimate before work begins",
    "Verified, insured technician",
    "All standard parts and materials",
    "Clean-up and haul-away",
    "30-day workmanship warranty",
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link to="/services"><ArrowLeft className="mr-1 h-4 w-4" /> All services</Link></Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="card-elevated grid place-items-center bg-gradient-to-br from-primary-soft to-white p-16">
          <img src={service.icon} alt={service.title} className="max-h-80 w-auto drop-shadow-[0_30px_40px_rgba(37,99,235,0.25)]" />
        </div>
        <div>
          <Badge variant="secondary" className="rounded-full">{service.category}</Badge>
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
            {included.map((i) => (
              <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /><span>{i}</span></li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]"><Link to="/book">Book Now</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/technicians">Browse Technicians</Link></Button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Insured</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Real-time tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
