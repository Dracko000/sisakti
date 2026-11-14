import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function ParentGrades() {
  return (
    <AppShell role="parent" title="Nilai & Rapor" subtitle="Rekap nilai anak">
      <Card className="p-2"><EmptyState title="Belum ada nilai" sub="Rapor & nilai akan tampil setelah guru menilai." /></Card>
    </AppShell>
  );
}
