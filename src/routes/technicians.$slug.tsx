import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, MapPin, Award, Briefcase, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { technicians } from "@/data/servicepro";

export const Route = createFileRoute("/technicians/$slug")({
  loader: ({ params }) => {
    const tech = technicians.find((t) => t.slug === params.slug);
    if (!tech) throw notFound();
    return { tech };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.tech.name} — ServicePro Technician` },
          { name: "description", content: loaderData.tech.bio },
          { property: "og:title", content: `${loaderData.tech.name} — ServicePro` },
          { property: "og:description", content: loaderData.tech.bio },
          { property: "og:image", content: loaderData.tech.avatar },
          { name: "twitter:image", content: loaderData.tech.avatar },
        ]
      : [{ title: "Technician not found — ServicePro" }, { name: "robots", content: "noindex" }],
  }),
  component: TechnicianProfile,
});

function TechnicianProfile() {
  const { tech } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link to="/technicians"><ArrowLeft className="mr-1 h-4 w-4" /> All technicians</Link></Button>

      <div className="card-elevated overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary to-[oklch(0.4_0.22_270)]" />
        <div className="px-8 pb-8">
          <div className="-mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-[var(--shadow-floating)]">
                <AvatarImage src={tech.avatar} alt={tech.name} />
                <AvatarFallback>{tech.name[0]}</AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <h1 className="text-3xl font-semibold tracking-tight">{tech.name}</h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {tech.city}</span>
                  <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> {tech.rating} · {tech.reviews} reviews</span>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]"><Link to="/book">Book this technician</Link></Button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Section title="About"><p className="text-muted-foreground">{tech.bio}</p></Section>

          <Section title="Specializations">
            <div className="flex flex-wrap gap-2">{tech.specializations.map((s) => <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>)}</div>
          </Section>

          <Section title="Certifications">
            <ul className="space-y-2">{tech.certificates.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-primary" /> {c}</li>
            ))}</ul>
          </Section>

          <Section title="Recent reviews">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2"><Star className="h-3.5 w-3.5 fill-warning text-warning" /><Star className="h-3.5 w-3.5 fill-warning text-warning" /><Star className="h-3.5 w-3.5 fill-warning text-warning" /><Star className="h-3.5 w-3.5 fill-warning text-warning" /><Star className="h-3.5 w-3.5 fill-warning text-warning" /></div>
                  <p className="mt-2 text-sm">{["Fast, clean, and professional. Would rebook in a heartbeat.", "Explained everything before and after the work. Top marks.", "Arrived early and finished under estimate."][i - 1]}</p>
                  <p className="mt-2 text-xs text-muted-foreground">— Verified customer, 2 weeks ago</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="card-elevated p-6 space-y-4">
            <Stat icon={Briefcase} label="Experience" value={`${tech.experienceYears} years`} />
            <Stat icon={Award} label="Completed jobs" value={tech.completedJobs.toLocaleString()} />
            <Stat icon={Globe} label="Languages" value={tech.languages.join(", ")} />
            <Stat icon={Clock} label="Availability" value={tech.available ? "Available today" : "Next slot tomorrow"} />
          </div>
          <div className="card-elevated p-6">
            <p className="eyebrow">Hourly rate</p>
            <p className="mt-1 text-3xl font-bold">${tech.hourlyRate}<span className="text-base font-normal text-muted-foreground">/hr</span></p>
            <p className="mt-2 text-xs text-muted-foreground">First 60 min minimum. Final quoted on-site.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-6">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Stat({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><I className="h-4 w-4" /></div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
