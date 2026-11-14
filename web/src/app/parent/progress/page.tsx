import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function ParentProgress() {
  return (
    <AppShell role="parent" title="Perkembangan Belajar" subtitle="Progres penguasaan materi anak">
      <Card className="p-2"><EmptyState title="Belum ada data perkembangan" sub="Penguasaan materi per mapel akan tampil setelah aktivitas belajar tercatat." /></Card>
    </AppShell>
  );
}
