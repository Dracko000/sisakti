import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function ParentNotes() {
  return (
    <AppShell role="parent" title="Catatan Guru" subtitle="Umpan balik & evaluasi">
      <Card className="p-2"><EmptyState title="Belum ada catatan" sub="Catatan dari guru akan tampil di sini." /></Card>
    </AppShell>
  );
}
