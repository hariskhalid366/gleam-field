import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, apiConfigured, type PublicSiteContent } from "@/lib/api";
import { Zap, Twitter, Linkedin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const { data } = useQuery({
    queryKey: ["footer-content"],
    enabled: apiConfigured,
    staleTime: 60_000,
    queryFn: () => api.content.publicSite().catch(() => ({ data: {} as PublicSiteContent })),
  });
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-bold tracking-tight">ServicePro</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Field service, delivered by verified professionals. Trusted by homeowners and
              enterprises across 42 metros.
            </p>
            <div className="mt-6 flex gap-2">
              {[Twitter, Linkedin, Instagram, Facebook].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Company"
            links={[
              ["About", "/why-us"],
              ["Careers", "/become-a-technician"],
              ["Pricing", "/pricing"],
              ["Contact", "/contact"],
            ]}
          />
          <FooterCol
            title="Services"
            links={[
              ["Electrical", "/services"],
              ["Plumbing", "/services"],
              ["HVAC", "/services"],
              ["All services", "/services"],
            ]}
          />
          <FooterCol
            title="Support"
            links={[
              ["FAQ", "/faq"],
              ["Track booking", "/track"],
              ["Emergency", "/book"],
              ["Admin login", "/admin-login"],
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} ServicePro, Inc. All rights reserved.</p>
          <p> Made with ❤️ by the ServicePro team </p>
          <div className="flex gap-4">
            <span>{data?.data?.privacyNotice || "Privacy Policy"}</span>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
