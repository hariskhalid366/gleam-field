import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — ServicePro Operations" },
      { name: "description", content: "Operational control center for ServicePro: bookings, technician verification, payments and reporting." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Panel — ServicePro Operations" },
      { property: "og:description", content: "Operational control center for ServicePro field service management." },
    ],
  }),
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
