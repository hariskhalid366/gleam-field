import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calendar,
  DollarSign,
  Shield,
  GraduationCap,
  IdCard,
  Briefcase,
  Smartphone,
  MessageCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  User,
  Wrench,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply as a Technician — ServicePro" },
      { name: "description", content: "Apply to join ServicePro in 4 steps. Verified pros earn on their own terms with insurance and training included." },
      { property: "og:title", content: "Apply as a Technician — ServicePro" },
      { property: "og:description", content: "Join 500+ verified pros. Flexible schedule, weekly payouts, insurance." },
    ],
  }),
  component: ApplyPage,
});

// --- 3D icon badge ---------------------------------------------------------
function BadgeIcon({
  icon: Icon,
  tone = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "emerald";
}) {
  const bg =
    tone === "blue"
      ? "radial-gradient(circle at 30% 25%, oklch(0.78 0.14 264) 0%, oklch(0.55 0.22 264) 55%, oklch(0.42 0.2 264) 100%)"
      : "radial-gradient(circle at 30% 25%, oklch(0.85 0.16 155) 0%, oklch(0.65 0.18 155) 55%, oklch(0.5 0.16 155) 100%)";
  return (
    <div
      className="relative grid h-12 w-12 place-items-center rounded-2xl text-white"
      style={{
        background: bg,
        boxShadow:
          "inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -6px 12px oklch(0 0 0 / 0.18), 0 10px 24px -8px oklch(0.55 0.22 264 / 0.45)",
      }}
    >
      <Icon className="h-5 w-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
      <span
        className="pointer-events-none absolute inset-x-1 top-1 h-3 rounded-t-xl opacity-70"
        style={{ background: "linear-gradient(180deg, oklch(1 0 0 / 0.55), transparent)" }}
      />
    </div>
  );
}

// --- data ------------------------------------------------------------------
const benefits = [
  { icon: Calendar, t: "Flexible schedule", d: "Work when you want." },
  { icon: DollarSign, t: "Weekly payouts", d: "Direct deposit every Friday." },
  { icon: Shield, t: "Insurance included", d: "$1M liability on every job." },
  { icon: GraduationCap, t: "Free training", d: "Certifications & gear discounts." },
];
const requirements = [
  { icon: IdCard, t: "Valid trade license & ID" },
  { icon: Briefcase, t: "2+ years experience" },
  { icon: Smartphone, t: "Smartphone with data" },
  { icon: MessageCircle, t: "Strong communication" },
];
const steps = [
  { n: 1, t: "Personal info", icon: User },
  { n: 2, t: "Professional", icon: Wrench },
  { n: 3, t: "Documents", icon: FileText },
  { n: 4, t: "Review", icon: ClipboardCheck },
];
const experienceLevels = ["1–2 yrs", "3–5 yrs", "6–10 yrs", "10+ yrs"];
const serviceCategories = [
  "Electrical",
  "Plumbing",
  "Air Conditioning",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Pest Control",
  "Appliance Repair",
  "Mechanic",
  "Generator Repair",
];

// --- form types ------------------------------------------------------------
type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  experience: string;
  categories: string[];
  bio: string;
  idFile: string | null;
  certFile: string | null;
  confirm: boolean;
};

function ApplyPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    city: "",
    experience: "",
    categories: [],
    bio: "",
    idFile: null,
    certFile: null,
    confirm: false,
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleCategory = (c: string) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));

  const canProceed = useMemo(() => {
    if (step === 1)
      return (
        form.name.trim().length > 1 &&
        form.phone.trim().length >= 7 &&
        /\S+@\S+\.\S+/.test(form.email) &&
        form.city.trim().length > 1
      );
    if (step === 2)
      return (
        form.experience !== "" &&
        form.categories.length > 0 &&
        form.bio.trim().length >= 20
      );
    if (step === 3) return !!form.idFile && !!form.certFile;
    if (step === 4) return form.confirm;
    return false;
  }, [step, form]);

  const submit = async () => {
    if (!canProceed || submitting) return;
    setSubmitting(true);
    try {
      if (apiConfigured) {
        await api.auth.register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          role: "technician",
          password: `${form.email.split("@")[0]}Temp#2024`,
          profile: {
            experience: form.experience,
            categories: form.categories,
            bio: form.bio,
          },
        });
        toast.success("Application submitted — we'll email you next steps.");
      } else {
        toast.success("Application submitted (demo — API not configured)");
      }
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your application");
    } finally {
      setSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
        <div className="relative">
          <div
            className="grid h-40 w-40 place-items-center rounded-full text-white animate-scale-in"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, oklch(0.88 0.16 155) 0%, oklch(0.68 0.17 155) 55%, oklch(0.5 0.16 155) 100%)",
              boxShadow:
                "inset 0 2px 0 oklch(1 0 0 / 0.6), inset 0 -14px 28px oklch(0 0 0 / 0.22), 0 30px 60px -20px oklch(0.55 0.18 155 / 0.55)",
            }}
          >
            <Check className="h-20 w-20 drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]" strokeWidth={3} />
            <span
              className="pointer-events-none absolute inset-x-6 top-4 h-10 rounded-full opacity-70"
              style={{ background: "linear-gradient(180deg, oklch(1 0 0 / 0.55), transparent)" }}
            />
          </div>
        </div>
        <h1 className="mt-10 text-5xl font-light tracking-tight sm:text-6xl">
          Application <span className="font-semibold">received.</span>
        </h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Thanks {form.name.split(" ")[0] || "there"} — our vetting team will
          review your application and reach out within 2 business days.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="btn-press shadow-[var(--shadow-glow)]">
            <Link to="/">Return Home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-hero-radial">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="mb-10">
          <p className="eyebrow">Technician application</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">
            Join the ServicePro <span className="font-semibold">network.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Four short steps. Most pros complete this in under 5 minutes.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card-elevated p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Benefits
              </h3>
              <ul className="mt-5 space-y-5">
                {benefits.map((b) => (
                  <li key={b.t} className="flex items-start gap-4">
                    <BadgeIcon icon={b.icon} tone="blue" />
                    <div>
                      <p className="font-semibold">{b.t}</p>
                      <p className="text-sm text-muted-foreground">{b.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-elevated p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Requirements
              </h3>
              <ul className="mt-5 space-y-4">
                {requirements.map((r) => (
                  <li key={r.t} className="flex items-center gap-4">
                    <BadgeIcon icon={r.icon} tone="emerald" />
                    <p className="text-sm font-medium">{r.t}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Form panel */}
          <div className="card-elevated p-6 sm:p-10">
            {/* Stepper */}
            <ol className="grid grid-cols-4 gap-3">
              {steps.map((s, i) => {
                const active = step === s.n;
                const done = step > s.n;
                return (
                  <li key={s.n} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "relative grid h-11 w-11 place-items-center rounded-2xl text-sm font-semibold transition-all",
                        active || done ? "text-white" : "text-muted-foreground",
                      )}
                      style={
                        active || done
                          ? {
                              background:
                                "radial-gradient(circle at 30% 25%, oklch(0.78 0.14 264) 0%, oklch(0.55 0.22 264) 55%, oklch(0.42 0.2 264) 100%)",
                              boxShadow:
                                "inset 0 1px 0 oklch(1 0 0 / 0.5), inset 0 -4px 10px oklch(0 0 0 / 0.18), 0 8px 20px -6px oklch(0.55 0.22 264 / 0.45)",
                            }
                          : {
                              background: "var(--color-surface-2)",
                              boxShadow: "inset 0 0 0 1px var(--color-border)",
                            }
                      }
                    >
                      {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <s.icon className="h-5 w-5" />}
                    </div>
                    <span
                      className={cn(
                        "hidden text-center text-xs font-medium sm:block",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.t}
                    </span>
                    {i < steps.length - 1 && (
                      <span className="sr-only">step separator</span>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(step / steps.length) * 100}%`,
                  background:
                    "linear-gradient(90deg, oklch(0.55 0.22 264), oklch(0.68 0.17 155))",
                  boxShadow: "0 0 12px oklch(0.55 0.22 264 / 0.6)",
                }}
              />
            </div>

            {/* Step content */}
            <div className="mt-10 animate-fade-in" key={step}>
              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name">
                    <Input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="(555) 123 4567"
                      inputMode="tel"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="jane@example.com"
                      type="email"
                    />
                  </Field>
                  <Field label="City">
                    <Input
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Austin"
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <Label className="mb-3 block text-sm font-semibold">Experience level</Label>
                    <div className="flex flex-wrap gap-2">
                      {experienceLevels.map((lvl) => {
                        const active = form.experience === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => update("experience", lvl)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-medium transition-all btn-press",
                              active
                                ? "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                                : "border-border bg-card hover:border-primary/40",
                            )}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block text-sm font-semibold">
                      Service categories <span className="font-normal text-muted-foreground">(select all that apply)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {serviceCategories.map((c) => {
                        const active = form.categories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCategory(c)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-medium transition-all btn-press",
                              active
                                ? "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                                : "border-border bg-card hover:border-primary/40",
                            )}
                          >
                            {active && <Check className="mr-1 inline h-3.5 w-3.5" strokeWidth={3} />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field label="Short bio (min 20 characters)">
                    <Textarea
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      placeholder="Tell customers what makes you a great pro."
                      rows={5}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.bio.trim().length}/20
                    </p>
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <DropCard
                    label="Government ID"
                    hint="Driver's license or passport"
                    file={form.idFile}
                    onFile={(name) => update("idFile", name)}
                  />
                  <DropCard
                    label="Trade certificate"
                    hint="License, diploma, or credential"
                    file={form.certFile}
                    onFile={(name) => update("certFile", name)}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-surface p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" /> Review
                    </h3>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Summary k="Name" v={form.name} />
                      <Summary k="Phone" v={form.phone} />
                      <Summary k="Email" v={form.email} />
                      <Summary k="City" v={form.city} />
                      <Summary k="Experience" v={form.experience} />
                      <Summary k="Categories" v={form.categories.join(", ") || "—"} />
                      <Summary k="ID document" v={form.idFile || "—"} />
                      <Summary k="Certificate" v={form.certFile || "—"} />
                    </dl>
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Bio</p>
                      <p className="mt-1 text-sm">{form.bio || "—"}</p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
                    <Checkbox
                      checked={form.confirm}
                      onCheckedChange={(v) => update("confirm", v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-muted-foreground">
                      I confirm the information above is accurate and agree to the
                      ServicePro Technician{" "}
                      <span className="font-medium text-foreground">Terms</span> and{" "}
                      <span className="font-medium text-foreground">Background Check Policy</span>.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Nav */}
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < 4 ? (
                <Button
                  size="lg"
                  disabled={!canProceed}
                  onClick={() => setStep((s) => s + 1)}
                  className="btn-press shadow-[var(--shadow-glow)]"
                >
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={!canProceed}
                  onClick={submit}
                  className="btn-press shadow-[var(--shadow-glow)]"
                >
                  Submit application <Check className="ml-1 h-4 w-4" strokeWidth={3} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{k}</p>
      <p className="mt-1 text-sm font-medium">{v || "—"}</p>
    </div>
  );
}

function DropCard({
  label,
  hint,
  file,
  onFile,
}: {
  label: string;
  hint: string;
  file: string | null;
  onFile: (name: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const pick = (files: FileList | null) => {
    if (files && files[0]) onFile(files[0].name);
  };
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        pick(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all",
        file
          ? "border-success/40 bg-success/5"
          : hover
            ? "border-primary bg-primary-soft"
            : "border-border bg-surface hover:border-primary/50 hover:bg-primary-soft/40",
      )}
    >
      <input
        type="file"
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
        accept="image/*,application/pdf"
      />
      {file ? (
        <>
          <BadgeIcon icon={Check} tone="emerald" />
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{file}</p>
            <p className="mt-2 text-xs font-medium text-primary">Replace file</p>
          </div>
        </>
      ) : (
        <>
          <BadgeIcon icon={Upload} tone="blue" />
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            <p className="mt-2 text-xs font-medium text-primary">Drop file or click to upload</p>
          </div>
        </>
      )}
    </label>
  );
}
