import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FileText, Pencil, Search, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, GlossyIcon, PageHeader, Panel, StatusPill } from "@/components/admin/kit";
import { api, type PublicSiteContent } from "@/lib/api";
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
  return <><PageHeader title="CMS" description="Live content blocks for the public website." crumbs={[{ label: "CMS" }]} actions={<Button asChild size="sm" variant="outline"><Link to="/" target="_blank">Preview site</Link></Button>} /><div className="mb-4 grid gap-4 sm:grid-cols-2"><Panel><div className="flex items-center gap-3"><GlossyIcon icon={FileText} /><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Content blocks</p><p className="text-xl font-semibold tracking-tight">{blocks.length}</p></div></div></Panel><Panel><div className="flex items-center gap-3"><GlossyIcon icon={Pencil} tone="emerald" /><div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last saved</p><p className="text-sm font-semibold tracking-tight">{updated(content.data?.updatedAt)}</p></div></div></Panel></div><Panel bodyClassName="p-0"><div className="flex flex-wrap items-center gap-3 border-b border-border p-4"><Tabs value={area} onValueChange={(value) => setArea(value as typeof area)}><TabsList>{areas.map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}</TabsList></Tabs><div className="relative ml-auto w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search content…" className="h-9 pl-9" /></div></div>{content.isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading content…</div> : content.isError ? <EmptyState icon={FileText} title="Could not load CMS content" description="Seed the backend content or check your administrator session." /> : !filtered.length ? <EmptyState icon={FileText} title="No content blocks" description="Nothing matches this area or search." /> : <ul className="divide-y divide-border">{filtered.map((block) => <li key={block.id} className="flex flex-wrap items-start gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{block.title}</p><StatusPill label={block.area} tone="indigo" /></div><p className="mt-1.5 text-sm text-muted-foreground">{block.value}</p><p className="mt-1 text-xs text-muted-foreground/80">Stored in the backend</p></div><Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditing(block); setDraft(block.value); }}><Pencil className="h-3.5 w-3.5" />Edit</Button></li>)}</ul>}</Panel><Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>{editing?.title}</DialogTitle></DialogHeader><div className="space-y-3"><p className="text-xs text-muted-foreground">Area · {editing?.area}</p><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} /></div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={!draft.trim() || save.isPending} onClick={publish}>{save.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Publish change</Button></DialogFooter></DialogContent></Dialog></>;
}
