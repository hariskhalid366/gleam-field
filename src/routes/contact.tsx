import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import mapImg from "@/assets/isometric-map.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ServicePro" },
      { name: "description", content: "Reach ServicePro sales, support, or the press team. Real humans, 24/7." },
      { property: "og:title", content: "Contact — ServicePro" },
      { property: "og:description", content: "Reach ServicePro support, sales, or press." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
        Let's <span className="font-semibold">talk.</span>
      </h1>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="card-elevated p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Message sent — we'll reply within 24 hours.");
            }}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input required placeholder="Jane Doe" /></Field>
              <Field label="Email"><Input required type="email" placeholder="jane@example.com" /></Field>
            </div>
            <Field label="Subject"><Input required placeholder="What can we help with?" /></Field>
            <Field label="Message"><Textarea required rows={6} placeholder="Tell us a bit more..." /></Field>
            <Button size="lg" className="mt-2 w-fit btn-press shadow-[var(--shadow-glow)]">{sent ? "Message sent ✓" : "Send message"}</Button>
          </form>
        </div>

        <aside className="space-y-4">
          <Info icon={Mail} label="Email" value="hello@servicepro.com" />
          <Info icon={Phone} label="Phone" value="+1 (800) 555-0199" />
          <Info icon={MapPin} label="HQ" value="500 Market St, San Francisco, CA" />
          <Info icon={Clock} label="Hours" value="Support 24/7 · Sales Mon–Fri" />
          <div className="card-elevated overflow-hidden p-4">
            <img src={mapImg} alt="ServicePro service area map" className="h-48 w-full object-contain" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}</div>;
}
function Info({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card-elevated flex items-center gap-4 p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"><I className="h-5 w-5" /></div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
