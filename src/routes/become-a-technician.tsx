import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, DollarSign, Shield, GraduationCap, IdCard, Briefcase, Smartphone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-technicians.png";

export const Route = createFileRoute("/become-a-technician")({
  head: () => ({
    meta: [
      { title: "Become a Technician — ServicePro" },
      { name: "description", content: "Join ServicePro. Flexible schedule, weekly payouts, insurance, and training. Apply in minutes." },
      { property: "og:title", content: "Become a Technician — ServicePro" },
      { property: "og:description", content: "Flexible schedule, weekly payouts, insurance, and training." },
    ],
  }),
  component: BecomePage,
});

function BecomePage() {
  const benefits = [
    { icon: Calendar, t: "Flexible schedule", d: "Work when you want. Set your own availability." },
    { icon: DollarSign, t: "Weekly payouts", d: "Direct deposit every Friday. No hidden fees." },
    { icon: Shield, t: "Insurance included", d: "$1M liability coverage on every job." },
    { icon: GraduationCap, t: "Free training", d: "Continuing education, certifications, and gear discounts." },
  ];
  const reqs = [
    { icon: IdCard, t: "Valid trade license & ID" },
    { icon: Briefcase, t: "2+ years experience" },
    { icon: Smartphone, t: "Smartphone with data" },
    { icon: MessageCircle, t: "Strong communication" },
  ];

  return (
    <div>
      <section className="bg-hero-radial">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">Careers</p>
            <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
              Build your <span className="font-semibold">field service business.</span>
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Join 500+ verified pros earning on their own terms — with the
              logistics, marketing, and insurance handled for you.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]"><Link to="/apply">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/contact">Talk to us</Link></Button>
            </div>
          </div>
          <div className="grid place-items-center">
            <img src={heroImg} alt="" className="max-h-96 w-auto drop-shadow-[0_40px_60px_rgba(37,99,235,0.25)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-4xl font-light tracking-tight sm:text-5xl">Benefits</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.t} className="card-elevated p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"><b.icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-lg font-semibold">{b.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-4xl font-light tracking-tight sm:text-5xl">Requirements</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reqs.map((r) => (
              <div key={r.t} className="card-elevated flex items-center gap-4 p-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><r.icon className="h-5 w-5" /></div>
                <p className="font-medium">{r.t}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]"><Link to="/apply">Start Application</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
