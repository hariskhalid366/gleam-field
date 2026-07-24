import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/why-us", label: "Why Us" },
  { to: "/technicians", label: "Technicians" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border transition-all duration-300",
            scrolled
              ? "border-border/70 bg-white/80 px-4 py-2 shadow-[var(--shadow-elevated)] backdrop-blur-xl"
              : "border-transparent bg-transparent px-4 py-3",
          )}
        >
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Zap className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold tracking-tight">ServicePro</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin-login">Admin</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="btn-press">
              <Link to="/become-a-technician">Become a Pro</Link>
            </Button>
            <Button asChild size="sm" className="btn-press shadow-[var(--shadow-glow)]">
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          <button
            className="rounded-lg p-2 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="mt-2 rounded-2xl border border-border/70 bg-white/95 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-xl lg:hidden animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/admin-login" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                Admin Login
              </Link>
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1"><Link to="/become-a-technician">Become a Pro</Link></Button>
                <Button asChild className="flex-1"><Link to="/book">Book Now</Link></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
