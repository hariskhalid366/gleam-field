import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
export type Tone = "blue" | "emerald" | "amber" | "red" | "slate" | "violet" | "indigo" | "cyan";

export const toneClass: Record<Tone, string> = {
  blue: "bg-primary/10 text-primary ring-primary/20",
  emerald: "bg-success/12 text-success ring-success/25",
  amber: "bg-warning/18 text-[oklch(0.52_0.13_70)] ring-warning/30",
  red: "bg-destructive/10 text-destructive ring-destructive/20",
  slate: "bg-muted text-muted-foreground ring-border",
  violet: "bg-[oklch(0.95_0.04_300)] text-[oklch(0.45_0.18_300)] ring-[oklch(0.85_0.06_300)]",
  indigo: "bg-[oklch(0.95_0.04_275)] text-[oklch(0.45_0.19_275)] ring-[oklch(0.85_0.07_275)]",
  cyan: "bg-[oklch(0.95_0.04_215)] text-[oklch(0.45_0.13_215)] ring-[oklch(0.85_0.06_215)]",
};

export function StatusPill({ label, tone, className }: { label: string; tone: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

/** Small glossy 3D icon badge — used sparingly (KPIs, empty states, ceremony moments). */
export function GlossyIcon({
  icon: Icon,
  tone = "blue",
  size = "md",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
}) {
  const grad: Record<Tone, string> = {
    blue: "from-[oklch(0.66_0.19_264)] to-[oklch(0.48_0.22_264)]",
    emerald: "from-[oklch(0.78_0.15_155)] to-[oklch(0.58_0.16_155)]",
    amber: "from-[oklch(0.86_0.14_75)] to-[oklch(0.68_0.16_60)]",
    red: "from-[oklch(0.70_0.20_27)] to-[oklch(0.52_0.23_27)]",
    slate: "from-[oklch(0.80_0.02_255)] to-[oklch(0.58_0.03_255)]",
    violet: "from-[oklch(0.72_0.16_300)] to-[oklch(0.52_0.19_300)]",
    indigo: "from-[oklch(0.70_0.16_275)] to-[oklch(0.50_0.19_275)]",
    cyan: "from-[oklch(0.76_0.12_215)] to-[oklch(0.56_0.13_215)]",
  };
  const dim = size === "lg" ? "h-14 w-14 rounded-2xl" : size === "sm" ? "h-8 w-8 rounded-[10px]" : "h-10 w-10 rounded-xl";
  const ic = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  return (
    <span
      className={cn(
        "relative grid place-items-center bg-gradient-to-b text-white shadow-[0_6px_16px_-6px_oklch(0.2_0.05_260/0.45)]",
        dim,
        grad[tone],
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/45 to-transparent opacity-70" />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/25" />
      <Icon className={cn("relative", ic)} strokeWidth={2.2} />
    </span>
  );
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 animate-fade-in">
      <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        {crumbs?.map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <span className="opacity-50">/</span>
            {c.to ? (
              <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
            ) : (
              <span className="font-medium text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-[0_1px_2px_oklch(0.2_0.04_265/0.05),0_8px_24px_-16px_oklch(0.2_0.04_265/0.18)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center animate-fade-in">
      <GlossyIcon icon={icon} size="lg" tone="slate" />
      <h3 className="mt-1 text-sm font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function num(n: number) {
  return n.toLocaleString("en-US");
}
export function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[720px] border-collapse text-sm tabular-nums">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 whitespace-nowrap border-b border-border bg-muted/60 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-border/70 px-4 py-3 align-middle", className)}>{children}</td>;
}

export function Tr({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn("transition-colors hover:bg-muted/50 focus-within:bg-muted/50", onClick && "cursor-pointer", className)}
    >
      {children}
    </tr>
  );
}
