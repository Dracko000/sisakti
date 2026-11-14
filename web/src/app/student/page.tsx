import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";

export default function StudentHome() {
  return (
    <AppShell role="student" title="Beranda" subtitle="Selamat datang di SiSAKTI">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary-dark p-7 text-white">
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-primary/50" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight">Ruang belajar digitalmu</h2>
            <p className="mt-2 text-sm text-primary-100">
              Akses buku SIBI, kelas live, papan interaktif, dan tugas — semuanya dalam satu tempat.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/student/library" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-dark">
                <Icon name="libraryBig" size={16} /> Jelajahi Buku SIBI
              </Link>
              <Link href="/student/board" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white">
                <Icon name="penLine" size={16} /> Buka Papan Interaktif
              </Link>
            </div>
          </div>
          <Mascot size={140} className="absolute right-6 top-6 hidden sm:block" />
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Hari Ini</h2>
          <Card className="p-2">
            <EmptyState
              title="Belum ada kelas atau tugas"
              sub="Jadwal, tugas, dan progres akan tampil di sini setelah data kelas tersedia (sinkronisasi Dapodik / penugasan guru)."
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Modul Selesai", "—", "bookOpen"],
            ["Rata-rata Nilai", "—", "chartColumn"],
            ["Kehadiran", "—", "userCheck"],
            ["Streak Belajar", "—", "flame"],
          ].map(([label, val, ic]) => (
            <Card key={label} className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sl-50">
                <Icon name={ic} size={20} className="text-muted" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">{label}</p>
                <p className="font-display text-xl font-bold text-ink">{val}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
