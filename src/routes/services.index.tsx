import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { services } from "@/data/servicepro";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "All Services — ServicePro" },
      { name: "description", content: "Browse every verified service ServicePro offers, from electrical to HVAC to appliance repair." },
      { property: "og:title", content: "All Services — ServicePro" },
      { property: "og:description", content: "Browse every verified service ServicePro offers." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const cats = ["All", ...Array.from(new Set(services.map((s) => s.category)))];
  const filtered = services.filter(
    (s) =>
      (cat === "All" || s.category === cat) &&
      (q === "" || s.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <p className="eyebrow">Services</p>
      <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
        Every trade you need, <span className="font-semibold">one platform.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Ten verified service categories, dispatched by 500+ background-checked
        professionals across 42 metros.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services..." className="pl-10 h-11 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {cats.map((c) => (
            <Button key={c} size="sm" variant={c === cat ? "default" : "outline"} onClick={() => setCat(c)} className="rounded-full">
              {c}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-elevated mt-12 grid place-items-center p-16 text-center">
          <p className="text-lg font-semibold">No services match your search</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or category.</p>
          <Button className="mt-6" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <div key={s.slug} className="card-elevated card-elevated-hover flex flex-col p-6">
              <img src={s.icon} alt="" className="h-20 w-20 object-contain" loading="lazy" />
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold">From ${s.startingPrice}</span>
                <Badge variant="secondary" className="rounded-full">{s.eta}</Badge>
              </div>
              <div className="mt-5 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/services/$slug" params={{ slug: s.slug }}>Details</Link></Button>
                <Button asChild size="sm" className="flex-1"><Link to="/book">Book</Link></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
