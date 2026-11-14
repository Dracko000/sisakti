import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function TasksPage() {
  return (
    <AppShell role="student" title="Tugas" subtitle="Kumpulkan tugas berbasis bab buku SIBI">
      <Card className="p-2">
        <EmptyState
          title="Belum ada tugas"
          sub="Tugas dari guru (termasuk tugas papan interaktif) akan tampil di sini."
        />
      </Card>
    </AppShell>
  );
}
