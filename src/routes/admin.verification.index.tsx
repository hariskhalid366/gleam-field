import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Search, Clock3, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { adminTechnicians, verificationStatusMeta } from "@/data/admin";

export const Route = createFileRoute("/admin/verification/")({
  head: () => ({
    meta: [
      { title: "Verification Queue — ServicePro Admin" },
      { name: "description", content: "Review, approve or reject technician applications before they gain app access." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Verification Queue — ServicePro Admin" },
      { property: "og:description", content: "Gate every technician application before they can accept jobs." },
    ],
  }),
  component: VerificationQueue,
});

function VerificationQueue() {
  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");

  const list = adminTechnicians.filter(
    (t) =>
      (tab === "all" ? t.status !== "approved" : t.status === tab) &&
      t.name.toLowerCase().includes(q.toLowerCase()),
  );

  const counts = {
    pending: adminTechnicians.filter((t) => t.status === "pending").length,
    under_review: adminTechnicians.filter((t) => t.status === "under_review").length,
    rejected: adminTechnicians.filter((t) => t.status === "rejected").length,
    suspended: adminTechnicians.filter((t) => t.status === "suspended").length,
  };

  return (
    <>
      <PageHeader
        title="Technician Verification"
        description="No technician receives bookings until an owner approves their application."
        crumbs={[{ label: "Verification Queue" }]}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-5 shadow-[0_10px_30px_-22px_oklch(0.4_0.2_264/0.8)]">
          <GlossyIcon icon={ShieldCheck} tone="blue" size="lg" />
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight">{counts.pending}</p>
            <p className="text-xs font-medium text-muted-foreground">Awaiting first review</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <GlossyIcon icon={Clock3} tone="amber" size="lg" />
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight">{counts.under_review}</p>
            <p className="text-xs font-medium text-muted-foreground">Under review</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <GlossyIcon icon={FileCheck2} tone="emerald" size="lg" />
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight">
              {adminTechnicians.filter((t) => t.status === "approved").length}
            </p>
            <p className="text-xs font-medium text-muted-foreground">Approved to date</p>
          </div>
        </div>
      </div>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
              <TabsTrigger value="under_review">Under review ({counts.under_review})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
              <TabsTrigger value="all">All open</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicants" className="h-9 pl-9" />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Queue is clear"
            description="No applications are waiting in this state. New technician sign-ups will land here automatically."
            action={<Button asChild size="sm"><Link to="/admin/technicians">View approved technicians</Link></Button>}
          />
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_oklch(0.2_0.04_265/0.45)]"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/15">
                    <AvatarImage src={t.avatar} alt={t.name} /><AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.experience} yrs experience · {t.city}</p>
                  </div>
                  <StatusPill {...verificationStatusMeta[t.status]} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Applied for</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {t.services.map((s) => (
                    <span key={s} className="rounded-lg bg-muted px-2 py-0.5 text-[11px] font-medium">{s}</span>
                  ))}
                </div>
                {t.rejectionReason && (
                  <p className="mt-3 rounded-xl bg-destructive/8 p-2.5 text-[11px] text-destructive">
                    <span className="font-semibold">Rejection reason:</span> {t.rejectionReason}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] tabular-nums text-muted-foreground">Applied {t.appliedAt}</span>
                  <Button asChild size="sm" className="btn-press">
                    <Link to="/admin/verification/$techId" params={{ techId: t.id }}>Review application</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
