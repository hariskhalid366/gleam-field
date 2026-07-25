import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Check, X, MessageSquareWarning, Download, FileText, ZoomIn, MapPin, Clock, Phone, Mail, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { adminTechnicians, verificationStatusMeta, type VerificationStatus } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/verification/$techId")({
  head: () => ({
    meta: [
      { title: "Application review — ServicePro Admin" },
      { name: "description", content: "Review identity documents, certificates and service areas before approving a technician." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Application review — ServicePro Admin" },
      { property: "og:description", content: "Review technician documents before granting app access." },
    ],
  }),
  component: ApplicationReview,
});

function ApplicationReview() {
  const { techId } = Route.useParams();
  const tech = adminTechnicians.find((t) => t.id === techId);
  const [status, setStatus] = useState<VerificationStatus>(tech?.status ?? "pending");
  const [reason, setReason] = useState(tech?.rejectionReason ?? "");
  const [approved, setApproved] = useState(false);

  if (!tech) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Application {techId} not found.</p>
        <Button asChild size="sm" className="mt-4"><Link to="/admin/verification">Back to queue</Link></Button>
      </div>
    );
  }

  if (approved) {
    return (
      <div className="grid place-items-center py-24 text-center animate-scale-in">
        <GlossyIcon icon={PartyPopper} tone="emerald" size="lg" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{tech.name} is approved</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The technician is now Active and can receive bookings in the Technician App. A welcome notification was sent.
        </p>
        <div className="mt-6 flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/admin/verification">Back to queue</Link></Button>
          <Button asChild size="sm"><Link to="/admin/technicians">Open technician list</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={tech.name}
        description={`${tech.experience} years experience · applied ${tech.appliedAt}`}
        crumbs={[{ label: "Verification Queue", to: "/admin/verification" }, { label: tech.id }]}
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/admin/verification"><ArrowLeft className="h-4 w-4" /> Queue</Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Documents downloaded (demo)")}>
              <Download className="h-4 w-4" /> Documents
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setStatus("under_review"); toast.success("Information request sent"); }}>
              <MessageSquareWarning className="h-4 w-4" /> Request info
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive"><X className="h-4 w-4" /> Reject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject {tech.name}?</DialogTitle>
                  <DialogDescription>A reason is required and stored in their history — visible if they resubmit.</DialogDescription>
                </DialogHeader>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what needs to change…" />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    disabled={reason.trim().length < 8}
                    onClick={() => { setStatus("rejected"); toast.success("Application rejected with reason"); }}
                  >
                    Reject application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="btn-press gap-1.5"><Check className="h-4 w-4" /> Approve</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve {tech.name}?</DialogTitle>
                  <DialogDescription>They become Active immediately and can start accepting bookings.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => { setStatus("approved"); setApproved(true); }}>Approve technician</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={tech.avatar} alt={tech.name} /><AvatarFallback>{tech.name[0]}</AvatarFallback>
              </Avatar>
              <div className="mr-auto">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{tech.name}</h2>
                  <StatusPill {...verificationStatusMeta[status]} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tech.bio}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Email", tech.email, Mail],
                ["Phone", tech.phone, Phone],
                ["City", tech.city, MapPin],
                ["Emergency contact", tech.emergencyContact, Phone],
                ["Working hours", tech.workingHours, Clock],
                ["Employment", tech.employment, FileText],
              ].map(([label, value, Icon]) => {
                const I = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <div key={label as string}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label as string}</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm"><I className="h-3.5 w-3.5 text-muted-foreground" /> {value as string}</dd>
                  </div>
                );
              })}
            </dl>
          </Panel>

          <Panel title="Documents" description="Zoom each document to verify legibility and expiry dates.">
            <div className="grid gap-3 sm:grid-cols-2">
              {tech.documents.map((d) => (
                <div key={d.name} className="rounded-xl border border-border p-3">
                  <div className="relative grid aspect-video place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,oklch(0.96_0.01_255),oklch(0.92_0.02_264))]">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <button
                      onClick={() => toast.success(`Opening ${d.name} viewer (demo)`)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg border border-border bg-card/80 backdrop-blur transition-colors hover:bg-card"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground">Uploaded {d.uploadedAt}</p>
                    </div>
                    <StatusPill label={d.verified ? "Verified" : "Needs check"} tone={d.verified ? "emerald" : "amber"} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Portfolio">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-[linear-gradient(135deg,oklch(0.95_0.02_255),oklch(0.90_0.03_264))]" />
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Skills & certificates">
            <div className="flex flex-wrap gap-1.5">
              {tech.services.map((s) => <span key={s} className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{s}</span>)}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {tech.certificates.map((c) => (
                <li key={c} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {c}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Service areas">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {tech.serviceAreas.map((a) => (
                <li key={a} className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {a}</li>
              ))}
            </ul>
            <div className="mt-3 h-28 rounded-xl border border-border bg-[linear-gradient(135deg,oklch(0.95_0.02_255),oklch(0.90_0.03_264))]" />
          </Panel>

          <Panel title="Verification history">
            <ol className="relative space-y-4 border-l border-border pl-4 text-sm">
              <li className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card" />
                Application submitted <span className="block text-[11px] text-muted-foreground">{tech.appliedAt}</span>
              </li>
              <li className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-card" />
                Documents received <span className="block text-[11px] text-muted-foreground">{tech.appliedAt}</span>
              </li>
              {status === "rejected" && (
                <li className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-4 ring-card" />
                  Rejected <span className="block text-[11px] text-destructive">{reason}</span>
                </li>
              )}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
