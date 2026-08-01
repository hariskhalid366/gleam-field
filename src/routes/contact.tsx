import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LoaderCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import mapImg from "@/assets/isometric-map.png";
import { api, apiConfigured } from "@/lib/api";

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
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values = {
      name: String(data.get("name") ?? "").trim(), email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(), message: String(data.get("message") ?? "").trim(),
    };
    const nextErrors: Record<string, string> = {};
    if (values.name.length < 2) nextErrors.name = "Enter your name.";
    if (!/\S+@\S+\.\S+/.test(values.email)) nextErrors.email = "Enter a valid email address.";
    if (values.subject.length < 5) nextErrors.subject = "Subject must be at least 5 characters.";
    if (values.message.length < 2) nextErrors.message = "Please add a message.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    setSending(true);
    try {
      if (apiConfigured) {
        const result = await api.support.contact(values);
        toast.success(result.repeatContact ? "Message received — your returning contact has been prioritized." : "Message sent — we'll reply within 24 hours.");
      } else {
        toast.success("Message sent (demo — API not configured)");
      }
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your message");
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
        Let's <span className="font-semibold">talk.</span>
      </h1>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="card-elevated p-8">
          <form
            onSubmit={handleSubmit}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.name}><Input required name="name" aria-invalid={!!errors.name} placeholder="Jane Doe" /></Field>
              <Field label="Email" error={errors.email}><Input required name="email" type="email" aria-invalid={!!errors.email} placeholder="jane@example.com" /></Field>
            </div>
            <Field label="Subject" error={errors.subject}><Input required name="subject" aria-invalid={!!errors.subject} placeholder="What can we help with?" /></Field>
            <Field label="Message" error={errors.message}><Textarea required name="message" aria-invalid={!!errors.message} rows={6} placeholder="Tell us a bit more..." /></Field>
            <Button size="lg" className="mt-2 w-fit btn-press shadow-[var(--shadow-glow)]" disabled={sending}>{sending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : sent ? "Message sent ✓" : "Send message"}</Button>
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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}{error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}</div>;
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
