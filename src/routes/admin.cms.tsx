import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FileText, Pencil, Search, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { api, type PublicSiteContent, type WhyUsContent } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cms")({ head: () => ({ meta: [{ title: "CMS — ServicePro Admin" }, { name: "robots", content: "noindex" }] }), component: CmsPage });
const areas = ["All", "Homepage", "Pricing", "FAQ", "Banners", "Legal"] as const;
type CmsBlock = { id: "heroHeadline" | "heroSubcopy" | "emergencyBlurb" | "responseTime" | "siteAnnouncement" | "privacyNotice"; area: Exclude<typeof areas[number], "All">; title: string; value: string };
const updated = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

function CmsPage() {
  const client = useQueryClient(); const [area, setArea] = useState<typeof areas[number]>("All"); const [q, setQ] = useState(""); const [editing, setEditing] = useState<CmsBlock | null>(null); const [draft, setDraft] = useState("");
  const content = useQuery({ queryKey: ["admin-public-site-content"], queryFn: () => api.content.admin("public.site") });
  const publicContent = (content.data?.data ?? {}) as PublicSiteContent;
  const blocks: CmsBlock[] = [
    { id: "heroHeadline", area: "Homepage", title: "Hero headline", value: publicContent.heroHeadline ?? "" },
    { id: "heroSubcopy", area: "Homepage", title: "Hero subcopy", value: publicContent.heroSubcopy ?? "" },
    { id: "emergencyBlurb", area: "Pricing", title: "Emergency plan blurb", value: publicContent.pricingPlans?.find((plan) => plan.id === "emergency")?.description ?? "" },
    { id: "responseTime", area: "FAQ", title: "Response time answer", value: publicContent.faqs?.[0]?.a ?? "" },
    { id: "siteAnnouncement", area: "Banners", title: "Site announcement", value: publicContent.siteAnnouncement ?? "" },
    { id: "privacyNotice", area: "Legal", title: "Privacy notice", value: publicContent.privacyNotice ?? "" },
  ];
  const save = useMutation({ mutationFn: (next: PublicSiteContent) => api.content.saveAdmin("public.site", next, "public"), onSuccess: () => { client.invalidateQueries({ queryKey: ["admin-public-site-content"] }); client.invalidateQueries({ queryKey: ["homepage"] }); client.invalidateQueries({ queryKey: ["footer-content"] }); setEditing(null); toast.success("Content published to the website"); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not publish content") });
  const filtered = useMemo(() => blocks.filter((block) => (area === "All" || block.area === area) && (!q || [block.title, block.value, block.area].some((value) => value.toLowerCase().includes(q.toLowerCase())))), [blocks, area, q]);
  const publish = () => {
    if (!editing || !draft.trim()) return;
    const value = draft.trim(); const next: PublicSiteContent = { ...publicContent };
    if (editing.id === "heroHeadline") next.heroHeadline = value;
    if (editing.id === "heroSubcopy") next.heroSubcopy = value;
    if (editing.id === "siteAnnouncement") next.siteAnnouncement = value;
    if (editing.id === "privacyNotice") next.privacyNotice = value;
    if (editing.id === "emergencyBlurb") next.pricingPlans = (next.pricingPlans ?? []).map((plan) => plan.id === "emergency" ? { ...plan, description: value } : plan);
    if (editing.id === "responseTime") next.faqs = (next.faqs ?? []).map((faq, index) => index === 0 ? { ...faq, a: value } : faq);
    save.mutate(next);
  };
  return <><PageHeader title="CMS" description="Live content blocks for the public website." crumbs={[{ label: "CMS" }]} actions={<Button asChild size="sm" variant="outline"><Link to="/" target="_blank">Preview site</Link></Button>} /><div className="mb-4 grid gap-4 sm:grid-cols-2"><Panel><div className="flex items-center gap-3"><GlossyIcon icon={FileText} /><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Content blocks</p><p className="text-xl font-semibold tracking-tight">{blocks.length}</p></div></div></Panel><Panel><div className="flex items-center gap-3"><GlossyIcon icon={Pencil} tone="emerald" /><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last saved</p><p className="text-sm font-semibold tracking-tight">{updated(content.data?.updatedAt)}</p></div></div></Panel></div><Panel bodyClassName="p-0"><div className="flex flex-wrap items-center gap-3 border-b border-border p-4"><Tabs value={area} onValueChange={(value) => setArea(value as typeof area)}><TabsList>{areas.map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}</TabsList></Tabs><div className="relative ml-auto w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search content…" className="h-9 pl-9" /></div></div>{content.isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading content…</div> : content.isError ? <EmptyState icon={FileText} title="Could not load CMS content" description="Seed the backend content or check your administrator session." /> : !filtered.length ? <EmptyState icon={FileText} title="No content blocks" description="Nothing matches this area or search." /> : <ul className="divide-y divide-border">{filtered.map((block) => <li key={block.id} className="flex flex-wrap items-start gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{block.title}</p><StatusPill label={block.area} tone="indigo" /></div><p className="mt-1.5 text-sm text-muted-foreground">{block.value}</p><p className="mt-1 text-xs text-muted-foreground/80">Stored in the backend</p></div><Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditing(block); setDraft(block.value); }}><Pencil className="h-3.5 w-3.5" />Edit</Button></li>)}</ul>}</Panel><WhyUsEditor /><Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>{editing?.title}</DialogTitle></DialogHeader><div className="space-y-3"><p className="text-xs text-muted-foreground">Area · {editing?.area}</p><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} /></div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={!draft.trim() || save.isPending} onClick={publish}>{save.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Publish change</Button></DialogFooter></DialogContent></Dialog></>;
}
const emptyWhyUsContent: WhyUsContent = {
  eyebrow: "Why choose us",
  title: "",
  emphasizedTitle: "",
  description: "",
  values: [],
  metrics: [],
};

function WhyUsEditor() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin-why-us-content"], queryFn: () => api.content.admin("public.why-us") });
  const [form, setForm] = useState<WhyUsContent | null>(null);
  const [detailsDraft, setDetailsDraft] = useState("");
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    if (!query.data?.data) return;
    const content = query.data.data as WhyUsContent;
    setForm(content);
    setDetailsDraft(JSON.stringify({ values: content.values, metrics: content.metrics }, null, 2));
  }, [query.data]);

  const save = useMutation({
    mutationFn: () => api.content.saveAdmin("public.why-us", form!, "public"),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-why-us-content"] });
      client.invalidateQueries({ queryKey: ["why-us"] });
      toast.success("Why Us content published");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not publish Why Us content"),
  });
  const generate = useMutation({
    mutationFn: api.content.generateWhyUs,
    onSuccess: (draft) => {
      setForm(draft);
      setDetailsDraft(JSON.stringify({ values: draft.values, metrics: draft.metrics }, null, 2));
      setDetailsError("");
      toast.success("Gemini created a draft. Review it, then publish when ready.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not generate Why Us content"),
  });

  const update = <K extends keyof WhyUsContent>(key: K, value: WhyUsContent[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const updateDetails = (value: string) => {
    setDetailsDraft(value);
    try {
      const parsed = JSON.parse(value) as Pick<WhyUsContent, "values" | "metrics">;
      if (!Array.isArray(parsed.values) || !Array.isArray(parsed.metrics)) throw new Error();
      update("values", parsed.values);
      update("metrics", parsed.metrics);
      setDetailsError("");
    } catch {
      setDetailsError("Use valid JSON with both values and metrics arrays before publishing.");
    }
  };

  if (query.isLoading) return <Panel className="mt-4" title="Why Us"><p className="text-sm text-muted-foreground">Loading website content…</p></Panel>;

  if (query.isError && !form) {
    return <Panel className="mt-4" title="Why Us page" description="Create the content record for the public /why-us page.">
      <Button onClick={() => { setForm(emptyWhyUsContent); setDetailsDraft(JSON.stringify({ values: [], metrics: [] }, null, 2)); }}>Create Why Us content</Button>
    </Panel>;
  }

  if (!form) return null;

  return <Panel className="mt-4" title="Why Us page" description="Edits publish to the public /why-us page.">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-sm text-muted-foreground">Generate a reviewable draft with Gemini. Nothing is published automatically.</p>
      <Button type="button" variant="outline" disabled={generate.isPending} onClick={() => generate.mutate()}>{generate.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate with Gemini AI</Button>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">Eyebrow<Input value={form.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} /></label>
      <label className="grid gap-1.5 text-sm font-medium">Main title<Input value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label className="grid gap-1.5 text-sm font-medium">Emphasized title<Input value={form.emphasizedTitle} onChange={(event) => update("emphasizedTitle", event.target.value)} /></label>
      <label className="grid gap-1.5 text-sm font-medium md:col-span-2">Description<Textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={3} /></label>
      <label className="grid gap-1.5 text-sm font-medium md:col-span-2">Values and metrics (JSON)<Textarea value={detailsDraft} onChange={(event) => updateDetails(event.target.value)} rows={12} /></label>
    </div>
    {detailsError && <p className="mt-2 text-sm text-destructive">{detailsError}</p>}
    <Button className="mt-4" disabled={save.isPending || !!detailsError} onClick={() => save.mutate()}>{save.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Publish Why Us page</Button>
  </Panel>;
}
