import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Layers, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money } from "@/components/admin/kit";
import { api, type ApiService, type ServiceInput } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Services — ServicePro Admin" }, { name: "robots", content: "noindex" }] }),
  component: ServicesPage,
});

const emptyForm: ServiceInput = {
  name: "", slug: "", description: "", category: "General", basePrice: 0, emergencyPrice: 0,
  estimatedDuration: "", included: [], isActive: true,
};

function ServicesPage() {
  const client = useQueryClient();
  const [editor, setEditor] = useState<ApiService | "new" | null>(null);
  const { data: items = [], isLoading, isError } = useQuery({ queryKey: ["admin-services"], queryFn: api.services.listAdmin });
  const refresh = () => client.invalidateQueries({ queryKey: ["admin-services"] });
  const update = useMutation({ mutationFn: ({ id, body }: { id: string; body: Partial<ServiceInput> }) => api.services.update(id, body), onSuccess: () => { refresh(); toast.success("Service updated"); }, onError: showError });
  const deactivate = useMutation({ mutationFn: api.services.deactivate, onSuccess: () => { refresh(); toast.success("Service hidden from public listings"); }, onError: showError });

  return <>
    <PageHeader title="Services & pricing" description="Changes publish directly to the public pricing page and booking catalog." crumbs={[{ label: "Services" }]} actions={<Button size="sm" className="btn-press gap-1.5" onClick={() => setEditor("new")}><Plus className="h-4 w-4" /> Add service</Button>} />
    <Panel bodyClassName="p-0">
      {isLoading ? <div className="flex justify-center py-16 text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading services…</div> : isError ? <div className="p-8 text-center"><p className="font-semibold">Could not load services</p><p className="mt-2 text-sm text-muted-foreground">Check the backend connection and sign-in session.</p></div> : items.length === 0 ? <EmptyState icon={Layers} title="No services configured" description="Add your first service category to open bookings on the public website." /> : <TableShell><thead><tr><Th>Service</Th><Th className="text-right">Starting price</Th><Th className="text-right">Emergency</Th><Th>Duration</Th><Th>Included</Th><Th>Public listing</Th><Th /></tr></thead><tbody>{items.map((service) => <Tr key={service._id}><Td><p className="font-medium">{service.name}</p><p className="text-xs text-muted-foreground">{service.category ?? "General"}</p></Td><Td className="text-right">{money(service.basePrice)}</Td><Td className="text-right">{money(service.emergencyPrice)}</Td><Td className="text-muted-foreground">{service.estimatedDuration}</Td><Td className="max-w-48 truncate text-muted-foreground">{service.included?.join(", ") || "—"}</Td><Td><span className="flex items-center gap-2"><Switch checked={service.isActive ?? true} disabled={update.isPending} onCheckedChange={(isActive) => update.mutate({ id: service._id, body: { isActive } })} /><StatusPill label={service.isActive ?? true ? "Live" : "Hidden"} tone={service.isActive ?? true ? "emerald" : "slate"} /></span></Td><Td className="text-right"><span className="flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditor(service)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" disabled={deactivate.isPending || !service.isActive} onClick={() => deactivate.mutate(service._id)}><Trash2 className="h-4 w-4" /></Button></span></Td></Tr>)}</tbody></TableShell>}
    </Panel>
    <ServiceEditor value={editor} onClose={() => setEditor(null)} onSaved={refresh} />
  </>;
}

function ServiceEditor({ value, onClose, onSaved }: { value: ApiService | "new" | null; onClose: () => void; onSaved: () => void }) {
  const existing = value !== null && value !== "new" ? value : undefined;
  const open = value !== null;
  // A keyed inner form gives each edit/create action fresh server values.
  return <Dialog open={open} onOpenChange={(next) => !next && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{existing ? `Edit ${existing.name}` : "New service"}</DialogTitle></DialogHeader><ServiceForm key={existing?._id ?? "new"} initial={existing ? toForm(existing) : emptyForm} savingClose={onClose} onSaved={onSaved} existing={existing} /></DialogContent></Dialog>;
}

function ServiceForm({ initial, existing, savingClose, onSaved }: { initial: ServiceInput; existing?: ApiService; savingClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const mutation = useMutation({ mutationFn: () => existing ? api.services.update(existing._id, form) : api.services.create(form), onSuccess: () => { onSaved(); toast.success(existing ? "Service and pricing updated" : "Service created and published"); savingClose(); }, onError: showError });
  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => { if (!form.name.trim() || !form.slug.trim()) return toast.error("Service name and URL slug are required."); mutation.mutate(); };
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Service name"><Input value={form.name} onChange={(e) => { const name = e.target.value; set("name", name); if (!existing) set("slug", slugify(name)); }} /></Field><Field label="URL slug"><Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></Field></div><Field label="Description"><Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></Field><Field label="Estimated duration"><Input value={form.estimatedDuration ?? ""} onChange={(e) => set("estimatedDuration", e.target.value)} /></Field><Field label="Starting price"><Input type="number" min="0" value={form.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} /></Field><Field label="Emergency price"><Input type="number" min="0" value={form.emergencyPrice} onChange={(e) => set("emergencyPrice", Number(e.target.value))} /></Field></div><Field label="What's included (one item per line)"><Textarea value={form.included.join("\n")} onChange={(e) => set("included", e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} /></Field><label className="flex items-center gap-3 text-sm font-medium"><Switch checked={form.isActive} onCheckedChange={(checked) => set("isActive", checked)} /> Publish this listing</label><DialogFooter><Button variant="outline" onClick={savingClose}>Cancel</Button><Button disabled={mutation.isPending} onClick={submit}>{mutation.isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{existing ? "Save changes" : "Create service"}</Button></DialogFooter></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>; }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function toForm(service: ApiService): ServiceInput { return { name: service.name, slug: service.slug, description: service.description ?? "", category: service.category ?? "General", basePrice: service.basePrice, emergencyPrice: service.emergencyPrice, estimatedDuration: service.estimatedDuration, icon: service.icon, included: service.included ?? [], isActive: service.isActive ?? true }; }
function showError(error: unknown) { toast.error(error instanceof Error ? error.message : "The change could not be saved"); }
