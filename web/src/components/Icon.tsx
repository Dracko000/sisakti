import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";
import { Circle } from "lucide-react";

// Render a lucide icon by its exported name (for data-driven icons).
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (Lucide as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!Cmp) return <Circle {...props} />;
  return <Cmp {...props} />;
}
