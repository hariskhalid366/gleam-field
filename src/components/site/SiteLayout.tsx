import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// Full-bleed routes hide the standard site chrome.
// The admin panel ships its own chrome (AdminShell), so the marketing navbar/footer are hidden.
const bareRoutes = ["/admin-login", "/admin"];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = bareRoutes.some((p) => pathname.startsWith(p));

  if (bare) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-24">{children}</main>
      <Footer />
    </div>
  );
}
