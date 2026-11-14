import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function StudentGradesPage() {
  return (
    <AppShell role="student" title="Nilai & Rapor" subtitle="Rekap nilai kamu">
      <Card className="p-2">
        <EmptyState
          title="Belum ada nilai"
          sub="Nilai tugas, kuis, UTS/UAS, dan papan interaktif akan muncul setelah guru menilai."
        />
      </Card>
    </AppShell>
  );
}
