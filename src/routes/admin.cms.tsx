import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Pencil, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { cmsBlocks } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cms")({
  head: () => ({
    meta: [
      { title: "CMS — ServicePro Admin" },
      { name: "description", content: "Edit the public website content blocks: hero copy, pricing blurbs, FAQ answers and banners." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "CMS — ServicePro Admin" },
      { property: "og:description", content: "Edit the public website content blocks." },
    ],
  }),
  component: CmsPage,
});

const areas = ["All", "Homepage", "Pricing", "FAQ", "Banners", "Legal"] as const;

function CmsPage() {
  const [blocks, setBlocks] = useState(cmsBlocks);
  const [area, setArea] = useState<(typeof areas)[number]>("All");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<(typeof cmsBlocks)[number] | null>(null);
  const [draft, setDraft] = useState("");

  const filtered = useMemo(
    () =>
      blocks.filter(
        (b) =>
          (area === "All" || b.area === area) &&
          (!q || [b.title, b.value, b.area].some((v) => v.toLowerCase().includes(q.toLowerCase()))),
      ),
    [blocks, area, q],
  );

  const save = () => {
    if (!editing) return;
    setBlocks((bs) => bs.map((b) => (b.id === editing.id ? { ...b, value: draft, updated: "Just now" } : b)));
    setEditing(null);
    toast.success("Content published (demo)");
  };

  return (
    <>
      <PageHeader
        title="CMS"
        description="Everything editable on the public marketing site, without a deploy."
        crumbs={[{ label: "CMS" }]}
        actions={<Button size="sm" className="btn-press" onClick={() => toast.success("Preview opened (demo)")}>Preview site</Button>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Content blocks", value: blocks.length, icon: FileText },
          { label: "Media assets", value: 38, icon: ImageIcon },
          { label: "Pending publishes", value: 0, icon: Pencil },
        ].map((s) => (
          <Panel key={s.label}>
            <div className="flex items-center gap-3">
              <GlossyIcon icon={s.icon} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold tracking-tight">{s.value}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Tabs value={area} onValueChange={(v) => setArea(v as typeof area)}>
            <TabsList>
              {areas.map((a) => (
                <TabsTrigger key={a} value={a}>{a}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content…" className="h-9 pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No content blocks" description="Nothing matches this area or search term." />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((b) => (
              <li key={b.id} className="flex flex-wrap items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{b.title}</p>
                    <StatusPill label={b.area} tone="indigo" />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">Updated {b.updated}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => { setEditing(b); setDraft(b.value); }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Area · {editing?.area}</p>
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button className="btn-press" disabled={!draft.trim()} onClick={save}>Publish change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
