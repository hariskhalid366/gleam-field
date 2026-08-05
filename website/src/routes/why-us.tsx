import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ShieldCheck, MapPin, Lock, HeadphonesIcon, Sparkles, Award, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, apiConfigured, type WhyUsContent } from "@/lib/api";

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

const fallbackContent: WhyUsContent = {
  eyebrow: "Why us",
  title: "Enterprise-grade trust.",
  emphasizedTitle: "Consumer-grade ease.",
  description: "We built ServicePro for the standards of a Fortune 500 facilities team, with an experience simple enough for a first-time homeowner.",
  values: [
    ["shield-check", "Verified professionals", "Every pro is background-checked, license-verified, and $1M insured."], ["map-pin", "Real-time tracking", "Live GPS from dispatch to doorstep."], ["lock", "Secure payments", "Cards authorized at booking, only charged on completion."], ["headphones", "24/7 support", "Real humans on call, every hour."], ["sparkles", "Transparent pricing", "Starting rates upfront, written estimate on-site."], ["award", "Warrantied work", "30-day workmanship warranty on every job."], ["users", "Enterprise-ready", "Multi-site accounts, SLA reporting, invoicing."], ["check", "Instant dispatch", "Average 42 min response in metro areas."],
  ].map(([icon, title, description]) => ({ icon, title, description })),
  metrics: [["500+", "Verified pros"], ["42", "Metros served"], ["4.9★", "Avg rating"], ["<60min", "Emergency ETA"]].map(([value, label]) => ({ value, label })),
};

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck, "map-pin": MapPin, lock: Lock, headphones: HeadphonesIcon,
  sparkles: Sparkles, award: Award, users: Users, check: Check,
};

function WhyUsPage() {
  const { data, isError } = useQuery({
    queryKey: ["why-us"],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: api.content.whyUs,
  });
  const content = data?.data ?? (apiConfigured ? null : fallbackContent);
  if (!content) return <main className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl font-semibold">Why ServicePro</h1><p role="alert" className="mt-4 text-muted-foreground">{isError ? "This page is temporarily unavailable. Please try again shortly." : "Content has not been published yet."}</p></main>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="eyebrow">{content.eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-light tracking-tight sm:text-6xl">
        {content.title} <span className="font-semibold">{content.emphasizedTitle}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{content.description}</p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {content.values.map((value) => {
          const Icon = iconMap[value.icon] ?? Check;
          return (
            <div key={value.title} className="card-elevated p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"><Icon className="h-5 w-5" strokeWidth={2.2} /></div>
              <h3 className="mt-5 text-lg font-semibold">{value.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-4">
        {content.metrics.map((metric) => (
          <div key={metric.label} className="card-elevated p-6 text-center">
            <p className="text-4xl font-bold">{metric.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{metric.label}</p>
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
