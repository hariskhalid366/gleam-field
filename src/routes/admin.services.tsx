import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, StatusPill, TableShell, Td, Th, Tr, money, num } from "@/components/admin/kit";
import { serviceCatalog } from "@/data/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  head: () => ({
    meta: [
      { title: "Services — ServicePro Admin" },
      { name: "description", content: "Manage service categories, pricing, emergency rates and estimated durations." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Services — ServicePro Admin" },
      { property: "og:description", content: "Manage service categories and pricing." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [items, setItems] = useState(serviceCatalog);

  return (
    <>
      <PageHeader
        title="Services"
        description="These categories power the public website booking flow."
        crumbs={[{ label: "Services" }]}
        actions={
          <Dialog>
            <DialogTrigger asChild><Button size="sm" className="btn-press gap-1.5"><Plus className="h-4 w-4" /> Add service</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New service category</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Service name" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Base price" type="number" />
                  <Input placeholder="Emergency price" type="number" />
                </div>
                <Input placeholder="Estimated duration" />
                <Input placeholder="Required tools (comma separated)" />
              </div>
              <DialogFooter><Button onClick={() => toast.success("Service created (demo)")}>Create service</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Panel bodyClassName="p-0">
        {items.length === 0 ? (
          <EmptyState icon={Layers} title="No services configured" description="Add your first service category to open bookings on the public website." />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Service</Th><Th className="text-right">Base price</Th><Th className="text-right">Emergency</Th>
                <Th>Duration</Th><Th>Required tools</Th><Th className="text-right">Jobs</Th><Th>Active</Th><Th />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium">{s.name}</Td>
                  <Td className="text-right">{money(s.price)}</Td>
                  <Td className="text-right">{money(s.emergencyPrice)}</Td>
                  <Td className="text-muted-foreground">{s.duration}</Td>
                  <Td className="text-muted-foreground">{s.tools.join(", ")}</Td>
                  <Td className="text-right">{num(s.jobs)}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <Switch
                        checked={s.active}
                        onCheckedChange={(c) => {
                          setItems((prev) => prev.map((p) => (p.id === s.id ? { ...p, active: c } : p)));
                          toast.success(`${s.name} ${c ? "activated" : "deactivated"}`);
                        }}
                      />
                      <StatusPill label={s.active ? "Live" : "Hidden"} tone={s.active ? "emerald" : "slate"} />
                    </span>
                  </Td>
                  <Td className="text-right">
                    <span className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toast.success("Editor opened (demo)")}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => toast.success("Service deleted (demo)")}><Trash2 className="h-4 w-4" /></Button>
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </>
  );
}
