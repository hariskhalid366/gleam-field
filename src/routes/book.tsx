import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Star, Upload, X, MapPin, Calendar as CalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { services, technicians, bookingSteps } from "@/data/servicepro";
import mapImg from "@/assets/isometric-map.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Technician — ServicePro" },
      { name: "description", content: "Book a verified pro in six simple steps. Real-time tracking and transparent pricing included." },
      { property: "og:title", content: "Book a Technician — ServicePro" },
      { property: "og:description", content: "Book a verified pro in six simple steps." },
    ],
  }),
  component: BookingFlow,
});

type State = {
  service?: string;
  techId?: string;
  date?: Date;
  slot?: string;
  address: { street: string; apt: string; city: string; postal: string; notes: string };
  images: string[];
};

function BookingFlow() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>({ address: { street: "", apt: "", city: "", postal: "", notes: "" }, images: [] });
  const navigate = useNavigate();

  const canNext = () => {
    if (step === 0) return !!state.service;
    if (step === 1) return !!state.techId;
    if (step === 2) return !!state.date && !!state.slot;
    if (step === 3) return state.address.street && state.address.city && state.address.postal;
    return true;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Stepper current={step} />

      <div className="card-elevated mt-8 p-6 sm:p-10">
        {step === 0 && <StepService state={state} setState={setState} />}
        {step === 1 && <StepTechnician state={state} setState={setState} />}
        {step === 2 && <StepDate state={state} setState={setState} />}
        {step === 3 && <StepAddress state={state} setState={setState} />}
        {step === 4 && <StepImages state={state} setState={setState} />}
        {step === 5 && <StepSummary state={state} />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < bookingSteps.length - 1 ? (
          <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className="btn-press">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button className="btn-press shadow-[var(--shadow-glow)]" disabled={submitting} onClick={submitBooking}>
            {submitting ? "Confirming…" : "Confirm Booking"}
          </Button>
        )}

      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {bookingSteps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex min-w-fit items-center gap-2">
            <div className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all",
              done && "bg-success text-success-foreground shadow-[var(--shadow-elevated)]",
              active && "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] scale-110",
              !done && !active && "border border-border bg-card text-muted-foreground",
            )}>
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("hidden text-xs font-medium sm:inline", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            {i < bookingSteps.length - 1 && <div className={cn("h-px w-8 sm:w-12", done ? "bg-success" : "bg-border")} />}
          </div>
        );
      })}
    </div>
  );
}

function StepService({ state, setState }: { state: State; setState: (s: State) => void }) {
  return (
    <>
      <StepHead title="Choose a service" desc="Pick the category that best matches your job." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const active = state.service === s.slug;
          return (
            <button
              key={s.slug}
              onClick={() => setState({ ...state, service: s.slug })}
              className={cn(
                "card-elevated card-elevated-hover flex flex-col items-start p-5 text-left",
                active && "ring-2 ring-primary shadow-[var(--shadow-floating)]",
              )}
            >
              <img src={s.icon} className="h-16 w-16 object-contain" alt="" loading="lazy" />
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground">From ${s.startingPrice} · {s.eta}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepTechnician({ state, setState }: { state: State; setState: (s: State) => void }) {
  return (
    <>
      <StepHead title="Choose your technician" desc="Or skip — we'll auto-assign the top available pro." />
      <div className="grid gap-4 sm:grid-cols-2">
        {technicians.map((t) => {
          const active = state.techId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setState({ ...state, techId: t.id })}
              className={cn("card-elevated card-elevated-hover flex gap-4 p-5 text-left", active && "ring-2 ring-primary shadow-[var(--shadow-floating)]")}
            >
              <Avatar className="h-14 w-14"><AvatarImage src={t.avatar} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.name}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-warning text-warning" /> {t.rating} · {t.completedJobs} jobs
                </div>
                <div className="mt-2 flex flex-wrap gap-1">{t.specializations.map((s) => <Badge key={s} variant="secondary" className="rounded-full text-[10px]">{s}</Badge>)}</div>
              </div>
              <div className="text-right text-sm"><p className="font-semibold">${t.hourlyRate}</p><p className="text-xs text-muted-foreground">/hr</p></div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepDate({ state, setState }: { state: State; setState: (s: State) => void }) {
  const slots = { Morning: ["8:00", "9:00", "10:00", "11:00"], Afternoon: ["12:00", "13:00", "14:00", "15:00"], Evening: ["16:00", "17:00", "18:00", "19:00"] };
  return (
    <>
      <StepHead title="Select date & time" desc="All times shown in your local timezone." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-4">
          <Calendar mode="single" selected={state.date} onSelect={(d) => setState({ ...state, date: d ?? undefined })} className="pointer-events-auto" />
        </div>
        <div className="space-y-4">
          {Object.entries(slots).map(([period, times]) => (
            <div key={period}>
              <p className="mb-2 text-sm font-semibold">{period}</p>
              <div className="grid grid-cols-4 gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setState({ ...state, slot: `${period} ${t}` })}
                    className={cn(
                      "rounded-lg border border-border bg-card px-2 py-2 text-sm font-medium transition btn-press hover:border-primary hover:text-primary",
                      state.slot === `${period} ${t}` && "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function StepAddress({ state, setState }: { state: State; setState: (s: State) => void }) {
  const a = state.address;
  const upd = (k: keyof State["address"], v: string) => setState({ ...state, address: { ...a, [k]: v } });
  return (
    <>
      <StepHead title="Service address" desc="Where should the technician arrive?" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Field label="Street address"><Input value={a.street} onChange={(e) => upd("street", e.target.value)} placeholder="123 Main St" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apartment / unit (optional)"><Input value={a.apt} onChange={(e) => upd("apt", e.target.value)} /></Field>
            <Field label="City"><Input value={a.city} onChange={(e) => upd("city", e.target.value)} /></Field>
          </div>
          <Field label="Postal code"><Input value={a.postal} onChange={(e) => upd("postal", e.target.value)} /></Field>
          <Field label="Additional notes"><Textarea rows={4} value={a.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="Access instructions, gate code, pets, etc." /></Field>
        </div>
        <div className="card-elevated overflow-hidden p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"><MapPin className="h-3 w-3" /> Service area</p>
          <img src={mapImg} alt="" className="h-52 w-full object-contain" />
          <p className="mt-2 text-center text-xs text-muted-foreground">Drag the pin to fine-tune your location.</p>
        </div>
      </div>
    </>
  );
}

function StepImages({ state, setState }: { state: State; setState: (s: State) => void }) {
  const [drag, setDrag] = useState(false);
  const add = (files: FileList) => {
    const urls = Array.from(files).slice(0, 5 - state.images.length).map((f) => URL.createObjectURL(f));
    setState({ ...state, images: [...state.images, ...urls].slice(0, 5) });
  };
  return (
    <>
      <StepHead title="Add photos (optional)" desc="Up to 5 photos help your technician arrive prepared." />
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files) add(e.dataTransfer.files); }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-12 text-center transition",
          drag && "border-primary bg-primary-soft",
        )}
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"><Upload className="h-6 w-6" /></div>
        <p className="mt-4 font-semibold">Drop photos here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB · Max 5 photos</p>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && add(e.target.files)} />
      </label>
      {state.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {state.images.map((u, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={u} className="h-full w-full object-cover" alt="" />
              <button
                onClick={() => setState({ ...state, images: state.images.filter((_, j) => j !== i) })}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StepSummary({ state }: { state: State }) {
  const service = services.find((s) => s.slug === state.service);
  const tech = technicians.find((t) => t.id === state.techId);
  const base = service?.startingPrice ?? 0;
  const tax = Math.round(base * 0.08);
  const total = base + tax;
  return (
    <>
      <StepHead title="Review your booking" desc="Everything look right?" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Row label="Service" value={service ? `${service.title} · ${service.eta}` : "—"} />
          <Row label="Technician" value={tech ? `${tech.name} · ${tech.rating}★` : "Auto-assign"} />
          <Row label="Date & time" value={state.date ? `${state.date.toDateString()} · ${state.slot ?? "—"}` : "—"} />
          <Row label="Address" value={`${state.address.street}${state.address.apt ? ` · ${state.address.apt}` : ""}, ${state.address.city} ${state.address.postal}`} />
          {state.address.notes && <Row label="Notes" value={state.address.notes} />}
        </div>
        <div className="card-elevated h-fit p-6">
          <p className="eyebrow">Estimated total</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Service base</span><span>${base}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxes & fees</span><span>${tax}</span></div>
          </div>
          <div className="mt-4 border-t border-border pt-4 flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-3xl font-bold">${total}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Card authorized now — charged after job completion.</p>
        </div>
      </div>
    </>
  );
}

function StepHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-elevated flex items-start justify-between gap-4 p-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

// referenced by icon import to satisfy tree-shake linter — no-op
const _ = CalIcon;
void _;
