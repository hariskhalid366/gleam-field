import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Star, ShieldCheck, MapPin, Lock, HeadphonesIcon,
  Check, ChevronDown, Clock, Sparkles, Siren,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { services, testimonials, pricingPlans, faqs, trustedCompanies, technicians, type Technician } from "@/data/servicepro";
import heroImg from "@/assets/hero-technicians.png";
import { api, apiConfigured, type ApiTechnician, type PublicSiteContent } from "@/lib/api";
import { toDisplayService } from "@/lib/service-display";

export const Route = createFileRoute("/")({
  // The application opens in the admin workspace. The /admin route validates
  // any stored session and redirects visitors without admin access to login.
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
  head: () => ({
    meta: [
      { title: "ServicePro — Reliable Home Services, Delivered by Verified Pros" },
      { name: "description", content: "Book trusted electricians, plumbers, AC technicians, and mechanics in a few clicks. Real-time tracking. Transparent pricing. 24/7 emergency dispatch." },
      { property: "og:title", content: "ServicePro — Field Service, Delivered by Verified Pros" },
      { property: "og:description", content: "Book trusted electricians, plumbers, AC technicians and mechanics in a few clicks." },
    ],
  }),
  component: LandingPage,
});

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function toHomepageTechnician(technician: ApiTechnician): Technician {
  const name = technician.user?.name ?? "ServicePro technician";
  return {
    id: technician._id,
    slug: slugify(name),
    name,
    avatar: technician.user?.avatarUrl ?? "",
    rating: technician.rating,
    reviews: 0,
    experienceYears: technician.experienceYears,
    completedJobs: technician.jobsCompleted,
    specializations: technician.services,
    languages: [],
    city: technician.city ?? technician.user?.city ?? "",
    available: technician.isAvailable,
    hourlyRate: technician.hourlyRate,
    bio: "",
    certificates: [],
  };
}

function LandingPage() {
  const { data, isError } = useQuery({
    queryKey: ["homepage"],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: async () => {
      const [liveServices, liveTechnicians, content] = await Promise.all([
        api.services.list(),
        api.technicians.list("?limit=3"),
        api.content.publicSite(),
      ]);
      return { liveServices, liveTechnicians, content: content.data };
    },
  });
  const offline = !apiConfigured;
  const homepage = {
    services: data?.liveServices?.map(toDisplayService) ?? (offline ? services : []),
    technicians: data?.liveTechnicians?.map(toHomepageTechnician) ?? (offline ? technicians : []),
    testimonials: data?.content?.testimonials ?? (offline ? testimonials : []),
    trustedCompanies: data?.content?.trustedCompanies ?? (offline ? trustedCompanies : []),
    pricingPlans: data?.content?.pricingPlans ?? (offline ? pricingPlans : []),
    faqs: data?.content?.faqs ?? (offline ? faqs : []),
  };

  return (
    <>
      {isError && <div role="alert" className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">Live website content is temporarily unavailable. Please refresh or try again shortly.</div>}
      <Hero headline={data?.content?.heroHeadline} subcopy={data?.content?.heroSubcopy} announcement={data?.content?.siteAnnouncement} useDefaults={offline} />
      <TrustedStrip companies={homepage.trustedCompanies} />
      <Services items={homepage.services} />
      <WhyUs />
      <HowItWorks />
      <FeaturedTechs items={homepage.technicians} />
      <Testimonials items={homepage.testimonials} />
      <Pricing plans={homepage.pricingPlans} />
      <EmergencyBanner />
      <FAQ items={homepage.faqs} />
    </>
  );
}

/* ---------- HERO ---------- */

function Hero({ headline, subcopy, announcement, useDefaults }: { headline?: string; subcopy?: string; announcement?: string; useDefaults: boolean }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      className="bg-hero-radial relative overflow-hidden"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-12 lg:grid-cols-12 lg:gap-8 lg:pb-32 lg:pt-16">
        <div className="lg:col-span-6 xl:col-span-6">
          <Badge variant="outline" className="rounded-full border-primary/20 bg-primary-soft px-3 py-1 text-primary">
            <Sparkles className="mr-1 h-3 w-3" /> {announcement ?? (useDefaults ? "Now serving 42 metros" : "ServicePro")}
          </Badge>
          <h1 className="mt-6 text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {headline ?? (useDefaults ? "Reliable home services, delivered by verified pros." : "Reliable home services.")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {subcopy ?? (useDefaults ? "Book trusted electricians, plumbers, AC technicians, mechanics, and more in just a few clicks — with live tracking, transparent pricing, and 24/7 emergency dispatch." : "Book a verified professional in a few clicks.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]">
              <Link to="/book">Book a Technician <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-press">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: "5,000+", l: "Completed jobs" },
              { v: "500+", l: "Verified pros" },
              { v: "4.9★", l: "Customer rating" },
              { v: "98%", l: "Satisfaction" },
            ].map((s) => (
              <div key={s.l} className="card-elevated p-4">
                <p className="text-2xl font-bold text-foreground">{s.v}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-6 xl:col-span-6">
          <div
            className="relative mx-auto aspect-square max-w-xl"
            style={{ transform: `translate3d(${mouse.x * -8}px, ${mouse.y * -8}px, 0)`, transition: "transform 300ms cubic-bezier(0.2,0.8,0.2,1)" }}
          >
            <img
              src={heroImg}
              alt="3D illustration of verified ServicePro technicians"
              width={1536}
              height={1280}
              className="h-full w-full object-contain drop-shadow-[0_40px_60px_rgba(37,99,235,0.25)]"
            />
          </div>

          {/* Floating hero cards */}
          <div
            className="absolute left-2 top-10 hidden md:block"
            style={{ transform: `translate3d(${mouse.x * 24}px, ${mouse.y * 24}px, 0)`, transition: "transform 400ms cubic-bezier(0.2,0.8,0.2,1)" }}
          >
            <FloatingCard>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-success/15 text-success">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Verified</p>
                  <p className="text-sm font-semibold">Background-checked</p>
                </div>
              </div>
            </FloatingCard>
          </div>

          <div
            className="absolute -bottom-2 right-2 hidden md:block"
            style={{ transform: `translate3d(${mouse.x * -24}px, ${mouse.y * -24}px, 0)`, transition: "transform 400ms cubic-bezier(0.2,0.8,0.2,1)" }}
          >
            <FloatingCard>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">ETA</p>
                  <p className="text-sm font-semibold">42 min · On the way</p>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-panel rounded-2xl px-4 py-3 shadow-[var(--shadow-floating)]">{children}</div>
  );
}

/* ---------- TRUSTED ---------- */

function TrustedStrip({ companies }: { companies: string[] }) {
  return (
    <section className="border-y border-border bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-center text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Trusted by leading property managers & enterprises
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((c) => (
            <span key={c} className="text-lg font-semibold tracking-tight text-muted-foreground/70 grayscale">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SERVICES ---------- */

function Services({ items }: { items: typeof services }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <SectionHeader
        eyebrow="Services"
        title="Every trade you need, one platform."
        description="Browse categorized services with transparent starting prices and real ETAs."
      />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.slice(0, 8).map((s) => (
          <div key={s.slug} className="card-elevated card-elevated-hover group flex flex-col p-6">
            <div className="mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-white">
              <img src={s.icon} alt="" width={80} height={80} className="h-16 w-16 object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3" loading="lazy" />
            </div>
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold">From ${s.startingPrice}</span>
              <span className="text-muted-foreground">{s.eta}</span>
            </div>
            <div className="mt-5 flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link to="/services/$slug" params={{ slug: s.slug }}>Details</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to="/book" search={{ service: s.slug } as never}>Book</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="outline"><Link to="/services">View all services</Link></Button>
      </div>
    </section>
  );
}

/* ---------- WHY US ---------- */

function WhyUs() {
  const feats = [
    { icon: ShieldCheck, title: "Verified professionals", desc: "Every pro is background-checked, license-verified, and $1M insured." },
    { icon: MapPin, title: "Real-time tracking", desc: "Live GPS from dispatch to doorstep — no more waiting windows." },
    { icon: Lock, title: "Secure payments", desc: "Cards authorized at booking, only charged on completion." },
    { icon: HeadphonesIcon, title: "24/7 support", desc: "Real humans on call, every hour, every day." },
  ];
  return (
    <section className="bg-mesh border-y border-border">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeader
          eyebrow="Why ServicePro"
          title="Enterprise-grade trust. Consumer-grade ease."
          description="The details that make the difference between a job done and a job done right."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {feats.map((f) => (
            <div key={f.title} className="card-elevated p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                <f.icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Choose service", d: "Pick from 10+ verified trades." },
    { n: "02", t: "Select date & time", d: "Book instantly or schedule ahead." },
    { n: "03", t: "Pro assigned", d: "A verified technician is dispatched." },
    { n: "04", t: "Live tracking", d: "Follow their ETA in real time." },
    { n: "05", t: "Service completed", d: "Pay only after the work is done." },
    { n: "06", t: "Rate experience", d: "Help the community with feedback." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <SectionHeader eyebrow="How it works" title="Six steps to a job done right." />
      <div className="relative mt-14">
        <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div
                className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.45_0.2_270)] text-primary-foreground shadow-[var(--shadow-glow)]"
                style={{ transform: `rotate(${i % 2 === 0 ? -4 : 4}deg)` }}
              >
                <span className="text-lg font-bold">{s.n}</span>
              </div>
              <h4 className="mt-5 text-base font-semibold">{s.t}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURED TECHS ---------- */

function FeaturedTechs({ items }: { items: typeof technicians }) {
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Meet the pros" title="Featured technicians." align="left" />
          <Button asChild variant="outline"><Link to="/technicians">Browse all</Link></Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((t) => (
            <Link
              key={t.id}
              to="/technicians/$slug"
              params={{ slug: t.slug }}
              className="card-elevated tilt-hover flex flex-col p-6"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-white shadow-[var(--shadow-elevated)]">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="font-medium">{t.rating}</span>
                    <span className="text-muted-foreground">· {t.reviews} reviews</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Stat label="Years" value={t.experienceYears} />
                <Stat label="Jobs" value={t.completedJobs.toLocaleString()} />
                <Stat label="Rate" value={`$${t.hourlyRate}`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.specializations.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className={cn("inline-flex items-center gap-1.5", t.available ? "text-success" : "text-muted-foreground")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", t.available ? "bg-success" : "bg-muted-foreground")} />
                  {t.available ? "Available today" : "Booked today"}
                </span>
                <span className="font-medium text-primary">View profile →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------- TESTIMONIALS ---------- */

function Testimonials({ items }: { items: typeof testimonials }) {
  const [idx, setIdx] = useState(0);
  // CMS records are editable. Ignore incomplete entries rather than allowing a
  // single malformed record to crash the entire homepage carousel.
  const safeItems = items.filter((item): item is (typeof testimonials)[number] => Boolean(item && item.quote && item.name && item.role));
  useEffect(() => {
    if (safeItems.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % safeItems.length), 6000);
    return () => clearInterval(t);
  }, [safeItems.length]);
  useEffect(() => { if (idx >= safeItems.length) setIdx(0); }, [idx, safeItems.length]);
  const t = safeItems[idx] ?? safeItems[0];
  if (!t) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <SectionHeader eyebrow="Customers" title="Loved by homeowners and enterprises alike." />
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <div key={t.id} className="card-elevated relative p-10 animate-fade-in">
          <div className="text-6xl leading-none text-primary/20">"</div>
          <p className="mt-2 text-xl leading-relaxed text-foreground">{t.quote}</p>
          <div className="mt-8 flex items-center gap-3">
            <Avatar className="h-11 w-11"><AvatarImage src={t.avatar} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
            <div className="ml-auto flex">
              {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            {safeItems.map((_, i) => (
              <button
                key={i}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setIdx(i)}
                className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-8 bg-primary" : "w-2 bg-border")}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {safeItems.slice(0, 4).map((tt) => (
            <div key={tt.id} className="card-elevated card-elevated-hover p-6">
              <div className="flex items-center gap-2">
                {Array.from({ length: tt.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}
              </div>
              <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{tt.quote}</p>
              <p className="mt-4 text-xs font-semibold">{tt.name} <span className="font-normal text-muted-foreground">· {tt.role}</span></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */

function Pricing({ plans }: { plans: typeof pricingPlans }) {
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeader eyebrow="Pricing" title="Simple, transparent, no surprises." />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={cn(
                "card-elevated relative flex flex-col p-8",
                p.recommended && "scale-[1.02] border-primary/30 shadow-[var(--shadow-floating)] lg:-translate-y-3",
              )}
            >
              {p.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)]">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">${p.price}</span>
                <span className="text-sm text-muted-foreground">/{p.cadence.replace("per ", "")}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={cn("mt-8", !p.recommended && "variant-outline")} variant={p.recommended ? "default" : "outline"}>
                <Link to="/book">Get started</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- EMERGENCY ---------- */

function EmergencyBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-[oklch(0.4_0.22_270)] p-10 text-primary-foreground shadow-[var(--shadow-glow)] lg:p-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Siren className="h-3.5 w-3.5" /> 24/7 emergency dispatch
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Need immediate assistance?
            </h3>
            <p className="mt-2 text-primary-foreground/85">
              Emergency technicians are available around the clock — in most metros within 60 minutes.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="btn-press">
            <Link to="/book">Book Emergency Service <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQ({ items }: { items: typeof faqs }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <SectionHeader eyebrow="FAQ" title="Frequently asked." />
      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {items.map((f, i) => (
          <AccordionItem
            key={i}
            value={`i-${i}`}
            className="card-elevated overflow-hidden border-none px-5 [&[data-state=open]]:shadow-[var(--shadow-floating)]"
          >
            <AccordionTrigger className="text-left text-base font-semibold hover:no-underline [&>svg]:hidden">
              <span className="flex-1">{f.q}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/* ---------- SHARED ---------- */

function SectionHeader({ eyebrow, title, description, align = "center" }: { eyebrow: string; title: string; description?: string; align?: "center" | "left" }) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-light tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-muted-foreground">{description}</p>}
    </div>
  );
}
