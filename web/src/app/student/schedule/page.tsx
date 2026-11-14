import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function SchedulePage() {
  return (
    <AppShell role="student" title="Jadwal Pelajaran" subtitle="Jadwal kelas kamu">
      <Card className="p-2">
        <EmptyState
          title="Belum ada jadwal"
          sub="Jadwal pelajaran akan tampil di sini setelah kelas dijadwalkan guru/admin."
        />
      </Card>
    </AppShell>
  );
}
