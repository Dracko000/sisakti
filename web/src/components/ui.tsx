import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface card-shadow",
        hover && "transition-transform hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  bg = "#e3f0fc",
  fg = "#0d47a1",
  dot,
  className,
}: {
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  dot?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      {children}
    </span>
  );
}

export function Progress({
  value,
  color = "#1e88e5",
  track = "#e2e8f0",
  className,
  height = 8,
}: {
  value: number;
  color?: string;
  track?: string;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full", className)}
      style={{ height, backgroundColor: track }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Avatar({
  initials,
  color = "#1e88e5",
  size = 40,
  className,
}: {
  initials: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white", className)}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tint,
  color,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  tint: string;
  color: string;
  trend?: string;
}) {
  return (
    <Card className="relative p-5">
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: tint }}
        >
          <Icon size={23} className="text-ink" style={{ color } as React.CSSProperties} />
        </div>
        {trend && (
          <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">
            {trend}
          </Pill>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1 text-[11px] font-medium text-subtle">{sub}</p>}
    </Card>
  );
}

export function SectionTitle({
  children,
  action,
  onAction,
}: {
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">{children}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-bold text-primary transition-colors hover:text-primary-dark"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function BarChart({
  values,
  labels,
  color = "#1e88e5",
  height = 140,
}: {
  values: number[];
  labels?: string[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1 self-stretch">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.85 }}
            />
          </div>
          {labels && <span className="text-[10px] font-semibold text-subtle">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}
