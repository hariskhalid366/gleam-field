import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, Search, Eye, EyeOff, Flag, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { adminReviews } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — ServicePro Admin" },
      { name: "description", content: "Moderate customer reviews, hide abusive content and monitor technician ratings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reviews — ServicePro Admin" },
      { property: "og:description", content: "Moderate customer reviews and monitor technician ratings." },
    ],
  }),
  component: ReviewsPage,
});

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={n <= rating ? "h-3.5 w-3.5 fill-warning text-warning" : "h-3.5 w-3.5 text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const [rows, setRows] = useState(adminReviews);
  const [tab, setTab] = useState<"all" | "reported" | "hidden" | "low">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchTab =
          tab === "all" ? true : tab === "reported" ? r.reported : tab === "hidden" ? r.hidden : r.rating <= 3;
        const t = q.toLowerCase();
        const matchQ = !t || [r.customer, r.technician, r.service, r.comment].some((v) => v.toLowerCase().includes(t));
        return matchTab && matchQ;
      }),
    [rows, tab, q],
  );

  const avg = (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(2);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: rows.filter((r) => r.rating === n).length }));

  const toggleHide = (id: string) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r)));
    toast.success("Review visibility updated (demo)");
  };

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Every review shown on the public website and on technician profiles."
        crumbs={[{ label: "Reviews" }]}
        actions={<Button size="sm" variant="outline" onClick={() => toast.success("Export queued (demo)")}>Export CSV</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Panel title="Rating overview">
            <div className="flex items-end gap-3">
              <p className="text-4xl font-semibold tracking-tight">{avg}</p>
              <div className="pb-1">
                <Stars rating={Math.round(Number(avg))} />
                <p className="mt-1 text-xs text-muted-foreground">{rows.length} reviews</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {dist.map((d) => (
                <div key={d.n} className="flex items-center gap-2.5 text-xs">
                  <span className="w-3 font-semibold">{d.n}</span>
                  <Progress value={(d.count / rows.length) * 100} className="h-1.5 flex-1" />
                  <span className="w-6 text-right text-muted-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Moderation queue">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reported</span>
                <StatusPill label={`${rows.filter((r) => r.reported).length} open`} tone="red" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hidden</span>
                <StatusPill label={`${rows.filter((r) => r.hidden).length}`} tone="slate" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">3★ and below</span>
                <StatusPill label={`${rows.filter((r) => r.rating <= 3).length}`} tone="amber" />
              </div>
            </div>
          </Panel>
        </div>

        <Panel bodyClassName="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="reported">Reported</TabsTrigger>
                <TabsTrigger value="hidden">Hidden</TabsTrigger>
                <TabsTrigger value="low">Low rated</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative ml-auto w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reviews…" className="h-9 pl-9" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No reviews match" description="Try a different tab or clear the search." />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((r) => (
                <li key={r.id} className="flex gap-3 p-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={r.customerAvatar} alt={r.customer} />
                    <AvatarFallback>{r.customer.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{r.customer}</p>
                      <Stars rating={r.rating} />
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                      {r.reported && <StatusPill label="Reported" tone="red" />}
                      {r.hidden && <StatusPill label="Hidden" tone="slate" />}
                    </div>
                    <p className="mt-1.5 text-sm text-foreground/90">{r.comment}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {r.service} · Technician {r.technician} · {r.id}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => toggleHide(r.id)}>
                        {r.hidden ? <><Eye className="h-3.5 w-3.5" /> Unhide</> : <><EyeOff className="h-3.5 w-3.5" /> Hide</>}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => toast.success("Flag cleared (demo)")}>
                        <Flag className="h-3.5 w-3.5" /> Clear flag
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => { setRows((rs) => rs.filter((x) => x.id !== r.id)); toast.success("Review deleted (demo)"); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
