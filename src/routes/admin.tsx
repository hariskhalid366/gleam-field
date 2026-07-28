import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAuthenticated } from "@/lib/api";

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
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // Session check runs on the client — the token lives in localStorage.
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/admin-login", replace: true });
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
