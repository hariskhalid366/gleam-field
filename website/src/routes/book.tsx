import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Upload,
  X,
  MapPin,
  Calendar as CalIcon,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { services, technicians, bookingSteps } from "@/data/servicepro";
import mapImg from "@/assets/isometric-map.png";
import { cn } from "@/lib/utils";
import { ApiError, api, apiConfigured, isAuthenticated, startSession, userStore, type ApiTechnician } from "@/lib/api";
import { toDisplayService } from "@/lib/service-display";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): { service?: string; technician?: string } => ({
    service: typeof search.service === "string" ? search.service : undefined,
    technician: typeof search.technician === "string" ? search.technician : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book a Technician — ServicePro" },
      {
        name: "description",
        content:
          "Book a verified pro in six simple steps. Real-time tracking and transparent pricing included.",
      },
      { property: "og:title", content: "Book a Technician — ServicePro" },
      { property: "og:description", content: "Book a verified pro in six simple steps." },
    ],
  }),
  component: BookingFlow,
});

type State = {
  serviceId?: string;
  techId?: string;
  date?: Date;
  slot?: string;
  address: { street: string; apt: string; city: string; postal: string; notes: string };
  images: Array<{ file: File; preview: string }>;
};

type BookingTechnician = (typeof technicians)[number];
const toBookingTechnician = (technician: ApiTechnician): BookingTechnician => ({
  id: technician._id,
  slug: (technician.user?.name ?? technician._id).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
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
});

function BookingFlow() {
  const { service: requestedService, technician: requestedTechnician } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>({
    techId: requestedTechnician,
    address: { street: "", apt: "", city: "", postal: "", notes: "" },
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const { data: liveServices } = useQuery({
    queryKey: ["services"],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: () => api.services.list().catch(() => []),
  });
  const { data: liveTechnicians } = useQuery({
    queryKey: ["booking-technicians"],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: () => api.technicians.list("?limit=100").catch(() => []),
  });
  // Fetch the profile-linked technician independently. This avoids relying on the
  // directory page size when a customer arrives from an individual profile.
  const { data: requestedTechnicianProfile } = useQuery({
    queryKey: ["booking-technician", requestedTechnician],
    enabled: apiConfigured && Boolean(requestedTechnician),
    staleTime: 60_000,
    queryFn: () => api.technicians.detail(requestedTechnician!),
  });
  const catalog = liveServices?.length
    ? liveServices.map((service) => ({ ...toDisplayService(service), id: service._id }))
    : services.map((service) => ({ ...service, id: service.slug }));
  const listedTechnicians = liveTechnicians?.length ? liveTechnicians.map(toBookingTechnician) : apiConfigured ? [] : technicians;
  const profileTechnician = requestedTechnicianProfile ? toBookingTechnician(requestedTechnicianProfile) : undefined;
  const allTechnicians = profileTechnician && !listedTechnicians.some((technician) => technician.id === profileTechnician.id)
    ? [profileTechnician, ...listedTechnicians]
    : listedTechnicians;
  const selectedServiceName = catalog.find((service) => service.id === state.serviceId)?.title;
  const technicianCatalog = allTechnicians.filter((technician) =>
    technician.available && (!selectedServiceName || technician.specializations.includes(selectedServiceName)),
  );

  useEffect(() => {
    if (state.serviceId || !requestedService) return;
    const service = catalog.find((item) => item.slug === requestedService);
    if (service) setState((current) => ({ ...current, serviceId: service.id }));
  }, [catalog, requestedService, state.serviceId]);
  useEffect(() => {
    if (state.techId || !requestedTechnician || !technicianCatalog.some((tech) => tech.id === requestedTechnician)) return;
    setState((current) => ({ ...current, techId: requestedTechnician }));
  }, [requestedTechnician, state.techId, technicianCatalog]);

  const submitBooking = async () => {
    setSubmitting(true);
    const service = catalog.find((item) => item.id === state.serviceId);
    if (apiConfigured && (!isAuthenticated() || userStore.get()?.role !== "customer")) {
      setAuthOpen(true);
      setSubmitting(false);
      return;
    }
    if (!service || !state.date || !state.slot) {
      setSubmitting(false);
      return;
    }
    let reference = "SP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    let bookingId: string | undefined;
    try {
      if (apiConfigured) {
        const [hours, minutes] = state.slot.split(" ")[1]!.split(":").map(Number);
        const scheduledFor = new Date(
          state.date.getFullYear(),
          state.date.getMonth(),
          state.date.getDate(),
          hours,
          minutes,
        ).toISOString();
        const uploads = await Promise.all(
          state.images.map((image) => api.files.uploadBookingPhoto(image.file)),
        );
        const created = await api.bookings.create({
          service: service.id,
          technician: liveTechnicians?.length ? state.techId : undefined,
          scheduledFor,
          isEmergency: false,
          address: {
            line1: `${state.address.street}${state.address.apt ? `, ${state.address.apt}` : ""}`,
            city: state.address.city,
            postalCode: state.address.postal,
            notes: state.address.notes || undefined,
          },
          photoFileIds: uploads.map((upload) => upload.fileId),
        });
        reference = created.reference;
        bookingId = created._id;
        toast.success("Booking confirmed");
      } else {
        toast.success("Booking confirmed (demo — API not configured)");
      }
      navigate({
        to: "/booking-confirmation",
        search: { ref: reference, id: bookingId, service: service?.title ?? "" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the booking");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!state.serviceId;
    if (step === 2) return !!state.date && !!state.slot;
    if (step === 3) return state.address.street && state.address.city && state.address.postal;
    return true;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Stepper current={step} />

      <div
        className={cn("card-elevated mt-8 p-6 sm:p-10", submitting && "pointer-events-none opacity-70")}
        aria-busy={submitting}
      >
        {step === 0 && <StepService state={state} setState={setState} catalog={catalog} selectedTechnician={allTechnicians.find((technician) => technician.id === state.techId)} />}
        {step === 1 && <StepTechnician state={state} setState={setState} catalog={technicianCatalog} />}
        {step === 2 && <StepDate state={state} setState={setState} />}
        {step === 3 && <StepAddress state={state} setState={setState} />}
        {step === 4 && <StepImages state={state} setState={setState} />}
        {step === 5 && <StepSummary state={state} catalog={catalog} technicianCatalog={technicianCatalog} />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < bookingSteps.length - 1 ? (
          <Button disabled={!canNext() || submitting} onClick={() => setStep((s) => s + 1)} className="btn-press">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="btn-press shadow-[var(--shadow-glow)]"
            disabled={submitting}
            onClick={submitBooking}
          >
            {submitting ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Confirming securely…</> : "Confirm Booking"}
          </Button>
        )}
      </div>
      <CustomerAuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-6 sm:gap-x-3">
      {bookingSteps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex min-w-0 flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold transition-colors",
                done && "bg-success text-success-foreground shadow-[var(--shadow-elevated)]",
                active &&
                  "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] ring-4 ring-primary/15",
                !done && !active && "border border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "min-w-0 text-xs font-medium leading-tight",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StepService({
  state,
  setState,
  catalog,
  selectedTechnician,
}: {
  state: State;
  setState: (s: State) => void;
  catalog: Array<(typeof services)[number] & { id: string }>;
  selectedTechnician?: BookingTechnician;
}) {
  return (
    <>
      <StepHead title="Choose a service" desc="Pick the category that best matches your job." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((s) => {
          const active = state.serviceId === s.id;
          return (
            <button
              key={s.slug}
              onClick={() => setState({
                ...state,
                serviceId: s.id,
                // Keep the profile-selected technician when they offer this service.
                techId: !selectedTechnician || selectedTechnician.specializations.includes(s.title)
                  ? state.techId
                  : undefined,
              })}
              className={cn(
                "card-elevated card-elevated-hover flex flex-col items-start p-5 text-left",
                active && "ring-2 ring-primary shadow-[var(--shadow-floating)]",
              )}
            >
              <img src={s.icon} className="h-16 w-16 object-contain" alt="" loading="lazy" />
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground">
                From ${s.startingPrice} · {s.eta}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepTechnician({ state, setState, catalog }: { state: State; setState: (s: State) => void; catalog: BookingTechnician[] }) {
  return (
    <>
      <StepHead
        title="Choose your technician"
        desc="Only verified, available technicians are selectable and confirmed by the server."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {catalog.length === 0 && <p className="text-sm text-muted-foreground">No verified technicians are currently available for direct selection. Dispatch will assign the best available professional.</p>}
        {catalog.map((t) => {
          const active = state.techId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setState({ ...state, techId: t.id })}
              className={cn(
                "card-elevated card-elevated-hover flex gap-4 p-5 text-left",
                active && "ring-2 ring-primary shadow-[var(--shadow-floating)]",
              )}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={t.avatar} />
                <AvatarFallback>{t.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.name}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-warning text-warning" /> {t.rating} ·{" "}
                  {t.completedJobs} jobs
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.specializations.map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">${t.hourlyRate}</p>
                <p className="text-xs text-muted-foreground">/hr</p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepDate({ state, setState }: { state: State; setState: (s: State) => void }) {
  const slots = {
    Morning: ["8:00", "9:00", "10:00", "11:00"],
    Afternoon: ["12:00", "13:00", "14:00", "15:00"],
    Evening: ["16:00", "17:00", "18:00", "19:00"],
  };
  return (
    <>
      <StepHead title="Select date & time" desc="All times shown in your local timezone." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-4">
          <Calendar
            mode="single"
            selected={state.date}
            onSelect={(d) => setState({ ...state, date: d ?? undefined })}
            className="pointer-events-auto"
          />
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
                      state.slot === `${period} ${t}` &&
                        "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]",
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
  const upd = (k: keyof State["address"], v: string) =>
    setState({ ...state, address: { ...a, [k]: v } });
  return (
    <>
      <StepHead title="Service address" desc="Where should the technician arrive?" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Field label="Street address">
            <Input
              value={a.street}
              onChange={(e) => upd("street", e.target.value)}
              placeholder="123 Main St"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apartment / unit (optional)">
              <Input value={a.apt} onChange={(e) => upd("apt", e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={a.city} onChange={(e) => upd("city", e.target.value)} />
            </Field>
          </div>
          <Field label="Postal code">
            <Input value={a.postal} onChange={(e) => upd("postal", e.target.value)} />
          </Field>
          <Field label="Additional notes">
            <Textarea
              rows={4}
              value={a.notes}
              onChange={(e) => upd("notes", e.target.value)}
              placeholder="Access instructions, gate code, pets, etc."
            />
          </Field>
        </div>
        <div className="card-elevated overflow-hidden p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <MapPin className="h-3 w-3" /> Service area
          </p>
          <img src={mapImg} alt="" className="h-52 w-full object-contain" />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Drag the pin to fine-tune your location.
          </p>
        </div>
      </div>
    </>
  );
}

function StepImages({ state, setState }: { state: State; setState: (s: State) => void }) {
  const [drag, setDrag] = useState(false);
  const add = (files: FileList) => {
    const images = Array.from(files)
      .slice(0, 5 - state.images.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setState({ ...state, images: [...state.images, ...images].slice(0, 5) });
  };
  return (
    <>
      <StepHead
        title="Add photos (optional)"
        desc="Up to 5 photos help your technician arrive prepared."
      />
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files) add(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-12 text-center transition",
          drag && "border-primary bg-primary-soft",
        )}
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <Upload className="h-6 w-6" />
        </div>
        <p className="mt-4 font-semibold">Drop photos here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB · Max 5 photos</p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && add(e.target.files)}
        />
      </label>
      {state.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {state.images.map((image, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <img src={image.preview} className="h-full w-full object-cover" alt="" />
              <button
                onClick={() =>
                  setState({ ...state, images: state.images.filter((_, j) => j !== i) })
                }
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

function StepSummary({
  state,
  catalog,
  technicianCatalog,
}: {
  state: State;
  catalog: Array<(typeof services)[number] & { id: string }>;
  technicianCatalog: BookingTechnician[];
}) {
  const service = catalog.find((item) => item.id === state.serviceId);
  const tech = technicianCatalog.find((t) => t.id === state.techId);
  const base = service?.startingPrice ?? 0;
  return (
    <>
      <StepHead title="Review your booking" desc="Everything look right?" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Row label="Service" value={service ? `${service.title} · ${service.eta}` : "—"} />
          <Row
            label="Technician"
            value={
              tech ? `${tech.name} selected` : "Secure auto-assignment"
            }
          />
          <Row
            label="Date & time"
            value={state.date ? `${state.date.toDateString()} · ${state.slot ?? "—"}` : "—"}
          />
          <Row
            label="Address"
            value={`${state.address.street}${state.address.apt ? ` · ${state.address.apt}` : ""}, ${state.address.city} ${state.address.postal}`}
          />
          {state.address.notes && <Row label="Notes" value={state.address.notes} />}
        </div>
        <div className="card-elevated h-fit p-6">
          <p className="eyebrow">Secure pricing</p>
          <p className="mt-4 text-3xl font-bold">From ${base}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Taxes, emergency surcharges, and the final total are calculated by ServicePro’s server
            when you confirm. Client-side values are never charged.
          </p>
        </div>
      </div>
    </>
  );
}

function CustomerAuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRules = [
    [password.length >= 10, "At least 10 characters"],
    [/[a-z]/.test(password), "One lowercase letter"],
    [/[A-Z]/.test(password), "One uppercase letter"],
    [/[0-9]/.test(password), "One number"],
  ] as const;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    if (mode === "register") {
      if (name.trim().length < 2) nextErrors.name = "Enter your full name (at least 2 characters).";
      if (passwordRules.some(([valid]) => !valid)) nextErrors.password = "Your password does not meet all requirements below.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await api.auth.login(email, password)
          : await api.auth.register({ name, email, password, role: "customer" });
      if (result.user.role !== "customer")
        throw new Error("Please use a customer account to book a service.");
      startSession(result);
      toast.success(mode === "login" ? "Signed in securely" : "Customer account created");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        const fieldErrors = Object.fromEntries(
          Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0] ?? "Invalid value"]),
        );
        setErrors(fieldErrors);
        toast.error("Please correct the highlighted fields.");
      } else if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: "An account already exists for this email. Please sign in instead." });
        toast.error("Please correct the highlighted fields.");
      } else if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        setErrors({ form: error.message });
        toast.error("Please review your account details.");
      } else {
        toast.error(error instanceof Error ? error.message : "Could not authenticate your account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Sign in to confirm your booking" : "Create a customer account"}
          </DialogTitle>
          <DialogDescription>
            Your booking is tied to a verified account and can only be viewed by you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <Field label="Full name" error={errors.name}>
              <Input required aria-invalid={!!errors.name} value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
          )}
          <Field label="Email" error={errors.email}>
            <Input
              required
              type="email"
              aria-invalid={!!errors.email}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <Input
              required
              type="password"
              minLength={mode === "register" ? 10 : 1}
              aria-invalid={!!errors.password}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {mode === "register" && (
              <ul className="mt-2 grid gap-1 text-xs text-muted-foreground">
                {passwordRules.map(([valid, label]) => (
                  <li key={label} className={cn("flex items-center gap-1.5", valid && "text-success")}>
                    <Check className="h-3.5 w-3.5" /> {label}
                  </li>
                ))}
              </ul>
            )}
          </Field>
          {errors.form && <p className="text-sm font-medium text-destructive">{errors.form}</p>}
          <Button className="w-full" disabled={loading}>
            {loading
              ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Please wait…</>
              : mode === "login"
                ? "Sign in & continue"
                : "Create account & continue"}
          </Button>
          <button
            type="button"
            className="w-full text-sm font-medium text-primary"
            onClick={() => setMode((value) => (value === "login" ? "register" : "login"))}
          >
            {mode === "login"
              ? "New to ServicePro? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
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
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-elevated flex items-start justify-between gap-4 p-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

// referenced by icon import to satisfy tree-shake linter — no-op
const _ = CalIcon;
void _;
