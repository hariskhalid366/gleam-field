import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { technicians } from "@/data/servicepro";
import { cn } from "@/lib/utils";
import { api, apiConfigured, type ApiTechnician } from "@/lib/api";

export const Route = createFileRoute("/technicians/")({
  head: () => ({
    meta: [
      { title: "Verified Technicians — ServicePro" },
      { name: "description", content: "Browse 500+ background-checked, insured field service technicians across every trade." },
      { property: "og:title", content: "Verified Technicians — ServicePro" },
      { property: "og:description", content: "Browse verified, insured field service technicians." },
    ],
  }),
  component: TechniciansPage,
});

function TechniciansPage() {
  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const params = new URLSearchParams({ limit: "100" });
  if (q) params.set("q", q);
  if (minRating) params.set("minRating", String(minRating));
  if (onlyAvailable) params.set("available", "true");
  const { data: liveTechnicians } = useQuery({
    queryKey: ["technicians", q, minRating, onlyAvailable],
    enabled: apiConfigured,
    staleTime: 30_000,
    queryFn: () => api.technicians.list(`?${params.toString()}`),
  });
  const items = apiConfigured ? (liveTechnicians ?? []).map(toDisplayTechnician) : technicians;
  const filtered = items.filter((t) =>
    (q === "" || t.name.toLowerCase().includes(q.toLowerCase()) || t.specializations.join(" ").toLowerCase().includes(q.toLowerCase())) &&
    t.rating >= minRating && (!onlyAvailable || t.available)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="eyebrow">Technicians</p>
      <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
        Meet the <span className="font-semibold">verified pros.</span>
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="card-elevated h-fit p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold">Search</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or skill" className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Minimum rating: {minRating.toFixed(1)}★</label>
            <Slider value={[minRating]} onValueChange={([v]) => setMinRating(v)} max={5} step={0.1} className="mt-3" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-4 w-4 rounded border-border" />
            Available today only
          </label>
          <Button variant="outline" className="w-full" onClick={() => { setQ(""); setMinRating(0); setOnlyAvailable(false); }}>Reset</Button>
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">{filtered.length} pros found</p>
          {filtered.length === 0 ? (
            <div className="card-elevated grid place-items-center p-16 text-center">
              <p className="text-lg font-semibold">No technicians match your filters</p>
              <Button className="mt-4" onClick={() => { setQ(""); setMinRating(0); setOnlyAvailable(false); }}>Reset filters</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filtered.map((t) => (
                <Link key={t.id} to="/technicians/$slug" params={{ slug: t.id }} className="card-elevated card-elevated-hover flex gap-4 p-5">
                  <Avatar className="h-16 w-16 shrink-0 ring-2 ring-white shadow-[var(--shadow-elevated)]">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold">{t.name}</p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest", t.available ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        {t.available ? "Available" : "Booked"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="font-medium">{t.rating}</span>
                      <span className="text-muted-foreground">· {t.reviews} reviews · {t.city}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.specializations.map((s) => <Badge key={s} variant="secondary" className="rounded-full text-[10px]">{s}</Badge>)}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t.experienceYears}y · {t.completedJobs} jobs</span>
                      <span className="font-semibold text-foreground">${t.hourlyRate}/hr</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toDisplayTechnician(technician: ApiTechnician) {
  return {
    id: technician._id,
    slug: technician._id,
    name: technician.user?.name ?? "ServicePro technician",
    avatar: technician.user?.avatarUrl ?? "",
    rating: technician.rating,
    reviews: 0,
    experienceYears: technician.experienceYears,
    completedJobs: technician.jobsCompleted,
    specializations: technician.services,
    languages: [],
    city: technician.city,
    available: technician.isAvailable,
    hourlyRate: technician.hourlyRate,
    bio: "",
    certificates: [],
  };
}
