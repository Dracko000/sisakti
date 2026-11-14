import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function ParentAttendance() {
  return (
    <AppShell role="parent" title="Laporan Presensi" subtitle="Kehadiran anak">
      <Card className="p-2"><EmptyState title="Belum ada data presensi" sub="Riwayat kehadiran akan tampil setelah sesi kelas berjalan." /></Card>
    </AppShell>
  );
}
