import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function ParentHome() {
  return (
    <AppShell role="parent" title="Ringkasan Anak" subtitle="Pantau perkembangan belajar anak Anda">
      <div className="space-y-5">
        <Card className="p-2">
          <EmptyState
            title="Belum ada data anak"
            sub="Ringkasan belajar, nilai, dan presensi akan tampil setelah akun orang tua ditautkan ke siswa (via Dapodik/sekolah)."
          />
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["Rata-rata Nilai", "Kehadiran", "Modul Selesai", "Waktu Belajar"].map((l) => (
            <Card key={l} className="p-5"><p className="text-xs font-semibold text-muted">{l}</p><p className="font-display text-2xl font-bold text-ink">—</p></Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
