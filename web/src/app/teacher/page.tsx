import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, StatCard } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { boardStats } from "@/lib/store";
import { School, ClipboardList, ChartColumn, UserCheck } from "lucide-react";

export default function TeacherDashboard() {
  const stats = boardStats();
  return (
    <AppShell role="teacher" title="Dashboard Guru" subtitle="Ringkasan kelas & aktivitas mengajar Anda">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-7 text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-primary-dark/40" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-2xl font-bold">Selamat datang di Studio Guru</h2>
            <p className="mt-2 text-sm text-primary-100">
              Kelola kelas live, nilai papan interaktif, dan buku nilai. Data kelas tersambung dari Dapodik.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/teacher/studio" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-dark">
                <Icon name="video" size={16} /> Mulai Kelas Live
              </Link>
              <Link href="/teacher/boards" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white">
                <Icon name="penLine" size={16} /> Nilai Papan Siswa
              </Link>
            </div>
          </div>
          <Mascot size={116} className="absolute right-8 top-4 hidden sm:block" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Kelas Aktif" value="—" sub="Belum ada data kelas" icon={School} tint="#e3f0fc" color="#1e88e5" />
          <StatCard label="Papan Perlu Dinilai" value={String(stats.pending)} sub="Papan interaktif menunggu" icon={ClipboardList} tint="#fff3e0" color="#b45309" />
          <StatCard label="Rata-rata Kelas" value={stats.avg ? String(stats.avg) : "—"} sub="Dari papan yang dinilai" icon={ChartColumn} tint="#dcfce7" color="#15803d" />
          <StatCard label="Kehadiran Pekan Ini" value="—" sub="Belum ada data presensi" icon={UserCheck} tint="#ede9fe" color="#8b5cf6" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Kelas yang Anda Ampu</h2>
            </div>
            <Card className="flex flex-col items-center gap-2 p-10 text-center">
              <Icon name="school" size={34} className="text-subtle" />
              <p className="font-display text-sm font-bold text-ink">Belum ada kelas</p>
              <p className="text-xs text-muted">Kelas & rombel akan tampil setelah disinkronkan dari Dapodik atau dibuat admin.</p>
              <Link href="/admin/dapodik" className="mt-1 text-xs font-bold text-primary">Integrasi Dapodik →</Link>
            </Card>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Perlu Dinilai</h2>
                <Link href="/teacher/boards" className="text-xs font-bold text-primary">Buka</Link>
              </div>
              <Card className="flex flex-col items-center gap-1 p-8 text-center">
                <Icon name="clipboardList" size={28} className="text-subtle" />
                <p className="text-xs text-muted">{stats.pending > 0 ? `${stats.pending} papan menunggu dinilai` : "Tidak ada papan menunggu"}</p>
              </Card>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-bold text-ink">Jadwal Mengajar</h2>
              <Card className="flex flex-col items-center gap-1 p-8 text-center">
                <Icon name="calendarDays" size={26} className="text-subtle" />
                <p className="text-xs text-muted">Belum ada jadwal</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
