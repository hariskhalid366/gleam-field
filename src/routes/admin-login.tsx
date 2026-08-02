import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ApiError, api, apiConfigured, startSession } from "@/lib/api";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Login — ServicePro" },
      { name: "description", content: "Business administrator portal for ServicePro." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Login — ServicePro" },
      { property: "og:description", content: "Business administrator portal for ServicePro." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiConfigured) {
      setError("Admin login is unavailable until the backend API is configured.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (!res.user || !["admin", "super_admin"].includes(res.user.role)) {
        await api.auth.logout();
        throw new Error("This account does not have administrator access.");
      }
      startSession(res);
      toast.success("Signed in securely");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      const message = err instanceof ApiError && err.status === 401 ? "Invalid email or password." : err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-[oklch(0.3_0.2_270)] lg:block">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(600px_at_20%_30%,white,transparent),radial-gradient(400px_at_80%_70%,white,transparent)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><Zap className="h-4 w-4" strokeWidth={2.5} /></span>
            <span className="text-lg font-bold tracking-tight">ServicePro</span>
          </Link>
          <div>
            <p className="text-4xl font-light leading-tight">
              Operate your entire field service business from a single dashboard.
            </p>
            <p className="mt-4 text-primary-foreground/70">Multi-site, SLA reporting, invoicing, dispatch.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <p className="eyebrow">Admin portal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">This portal is for business administrators only.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Work email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@company.com"
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="pl-9 h-11"
                />
              </div>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-border" /> Remember me
              </label>
              <a href="#" className="font-medium text-primary hover:underline">Forgot password?</a>
            </div>
            <Button className="w-full btn-press shadow-[var(--shadow-glow)]" size="lg" disabled={loading || !email || !password}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Not an admin? <Link to="/" className="font-medium text-primary hover:underline">Return home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
