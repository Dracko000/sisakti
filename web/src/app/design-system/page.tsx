import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { Card, Pill, Progress, Avatar } from "@/components/ui";
import { SUBJECT_LIST, paperClass, PAPER_LABELS } from "@/lib/subjects";

const COLORS = [
  ["Primary", "#1e88e5"], ["Primary Dark", "#0d47a1"], ["Primary 50", "#e3f0fc"],
  ["Accent", "#ff9800"], ["Accent Dark", "#f57c00"], ["Accent 50", "#fff3e0"],
  ["Ink", "#0f172a"], ["Text", "#334155"], ["Muted", "#64748b"],
  ["Line", "#e2e8f0"], ["Success", "#22c55e"], ["Danger", "#ef4444"],
];

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-bg">
      {/* header */}
      <div className="relative overflow-hidden bg-primary-dark px-6 py-8 text-white md:px-12">
        <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-primary/50" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary"><Icon name="bookOpen" size={26} /></div>
          <div>
            <p className="font-display text-2xl font-bold">SiSAKTI — Design System</p>
            <p className="text-sm text-primary-100">Token, warna, tipografi, komponen & papan per mapel · v1.0 · 2025</p>
          </div>
          <Link href="/" className="ml-auto flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/25">
            <Icon name="palette" size={16} /> Masuk aplikasi
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-10 md:px-12">
        {/* colors */}
        <section>
          <h2 className="font-display text-xl font-bold text-ink">01 · Palet Warna</h2>
          <p className="mt-1 text-sm text-muted">Biru edukasi untuk kepercayaan & kejelasan, oranye untuk semangat & interaktivitas.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {COLORS.map(([name, hex]) => (
              <div key={name}>
                <div className="h-20 rounded-xl border border-line" style={{ backgroundColor: hex }} />
                <p className="mt-2 text-xs font-bold text-ink">{name}</p>
                <p className="text-[11px] text-muted">{hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* typography */}
        <section>
          <h2 className="font-display text-xl font-bold text-ink">02 · Tipografi</h2>
          <p className="mt-1 text-sm text-muted">Poppins untuk judul, Inter untuk teks & antarmuka.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-baseline gap-4"><span className="font-display text-6xl font-bold text-primary-dark">Aa</span><span className="text-xs font-bold text-muted">Poppins · Display</span></div>
              <p className="mt-4 font-display text-2xl font-bold text-ink">Judul Halaman</p>
              <p className="mt-1 font-display text-lg font-semibold text-text">Sub-judul bagian</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-baseline gap-4"><span className="text-6xl font-bold text-primary-dark">Aa</span><span className="text-xs font-bold text-muted">Inter · Body & UI</span></div>
              <p className="mt-4 text-[15px] text-text">Teks paragraf standar untuk konten bacaan dan antarmuka aplikasi.</p>
              <p className="mt-2 text-xs font-medium text-muted">Label tombol · metadata · keterangan kecil 12px.</p>
            </Card>
          </div>
        </section>

        {/* components */}
        <section>
          <h2 className="font-display text-xl font-bold text-ink">03 · Komponen UI</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <p className="text-xs font-bold text-muted">Tombol</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Tombol Utama</button>
                <button className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white">Tombol Aksen</button>
                <button className="rounded-xl border-2 border-primary px-5 py-3 text-sm font-bold text-primary">Sekunder</button>
                <button className="rounded-xl bg-sl-50 px-5 py-3 text-sm font-semibold text-muted">Ghost</button>
              </div>
              <p className="mt-5 text-xs font-bold text-muted">Pill / Status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">Aktif</Pill>
                <Pill bg="#fff3e0" fg="#b45309" dot="#ff9800">Menunggu</Pill>
                <Pill bg="#e3f0fc" fg="#0d47a1" dot="#1e88e5">Selesai</Pill>
                <Pill bg="#fee2e2" fg="#b91c1c" dot="#ef4444">Terlambat</Pill>
              </div>
              <p className="mt-5 text-xs font-bold text-muted">Progress & Avatar</p>
              <div className="mt-2 flex items-center gap-4">
                <Progress value={72} className="w-40" />
                <div className="flex -space-x-2">
                  {[["RA", "#1e88e5"], ["BK", "#ff9800"], ["CD", "#22c55e"], ["EW", "#8b5cf6"]].map(([i, c]) => (
                    <Avatar key={i} initials={i} color={c} size={38} className="ring-2 ring-white" />
                  ))}
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-muted">Material Card & Maskot</p>
              <div className="mt-3 flex gap-4">
                <div className="w-40 overflow-hidden rounded-2xl card-shadow-sm">
                  <div className="flex h-20 items-center justify-center bg-primary"><Icon name="bookOpen" size={26} className="text-white" /></div>
                  <div className="p-3"><p className="text-[13px] font-bold text-ink">Matematika VIII</p><p className="text-[11px] text-muted">Bab 4 · Bangun Ruang</p></div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <Mascot size={110} />
                  <p className="mt-1 text-[11px] font-semibold text-muted">Maskot SiSAKTI</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* paper per subject */}
        <section>
          <h2 className="font-display text-xl font-bold text-ink">04 · Kertas & Toolbar per Mata Pelajaran</h2>
          <p className="mt-1 text-sm text-muted">Papan interaktif = buku tulis digital. Kertas & toolbar menyesuaikan mapel (paperless).</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUBJECT_LIST.map((s) => (
              <Card key={s.key} className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: s.color + "22" }}><Icon name="bookOpen" size={16} style={{ color: s.color }} /></div>
                  <div><p className="text-[13px] font-bold text-ink">{s.name}</p><p className="text-[10px] text-muted">Kertas: {PAPER_LABELS[s.paper]}</p></div>
                </div>
                <div className={`mt-3 h-24 rounded-lg border border-line ${paperClass(s.paper)}`} />
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.tools.slice(0, 6).map((t) => (
                    <span key={t.id} className="flex items-center gap-1 rounded-md bg-sl-50 px-1.5 py-1 text-[9px] font-semibold text-text"><Icon name={t.id} size={11} style={{ color: s.color }} /> {t.label}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <p className="pb-6 text-center text-xs text-subtle">© 2025 SiSAKTI · Terintegrasi SIBI Kemendikbudristek</p>
      </div>
    </div>
  );
}
