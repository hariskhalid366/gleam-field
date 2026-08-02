import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { api, isAuthenticated, tokenStore, userStore } from "@/lib/api";

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

  // Verify both the access token and the current server-side role before rendering admin data.
  useEffect(() => {
    if (!isAuthenticated()) return void navigate({ to: "/admin-login", replace: true });
    let active = true;
    void api.auth.me()
      .then((result) => {
        if (!active) return;
        if (!["admin", "super_admin"].includes(result.user.role)) {
          tokenStore.clear();
          navigate({ to: "/admin-login", replace: true });
          return;
        }
        userStore.set(result.user);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        tokenStore.clear();
        navigate({ to: "/admin-login", replace: true });
      });
    return () => { active = false; };
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
