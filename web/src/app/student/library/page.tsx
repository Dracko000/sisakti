"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { siswaBooks, SD_SUBJECTS, SD_GRADES } from "@/lib/books-sd";
import { cn } from "@/lib/cn";

const ALL = "Semua";
const ALL_CLASS = "Semua Kelas";

export default function LibraryPage() {
  const [subject, setSubject] = useState(ALL);
  const [grade, setGrade] = useState(ALL_CLASS);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return siswaBooks.filter(
      (b) =>
        (subject === ALL || b.subject === subject) &&
        (grade === ALL_CLASS || b.grade === grade) &&
        (!q ||
          b.title.toLowerCase().includes(q.toLowerCase()) ||
          b.subject.toLowerCase().includes(q.toLowerCase()) ||
          (b.author ?? "").toLowerCase().includes(q.toLowerCase())),
    );
  }, [subject, grade, q]);

  const subjects = [ALL, ...SD_SUBJECTS];
  const grades = [ALL_CLASS, ...SD_GRADES];

  return (
    <AppShell role="student" title="Katalog Buku SIBI — SD" subtitle="Buku Kurikulum Merdeka resmi dari SIBI Kemendikdasmen">
      <div className="space-y-5">
        {/* search + source badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul, mapel, penulis…"
              className="w-[300px] rounded-full border border-line bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">Sumber: SIBI Kemendikdasmen</Pill>
          <span className="text-xs font-semibold text-muted">{list.length} buku</span>
        </div>

        {/* subject filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-subtle">Mapel</span>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                subject === s ? "border-transparent bg-primary text-white" : "border-line bg-white text-text hover:border-primary-200",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* grade filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-subtle">Kelas</span>
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                grade === g ? "bg-accent text-white" : "bg-sl-50 text-muted hover:bg-accent-50",
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* featured banner */}
        <div className="relative overflow-hidden rounded-2xl bg-accent-50 p-6">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-accent" />
          <Pill bg="#ff9800" fg="#fff">Buku Kurikulum Merdeka · SD</Pill>
          <h2 className="mt-3 font-display text-xl font-bold text-ink">Belajar dari sumber resmi & legal</h2>
          <p className="mt-1 text-sm text-text">Koleksi buku teks SD/MI kelas I–VI, gratis diakses dari Sistem Informasi Perbukuan Indonesia.</p>
          <a href="https://buku.kemendikdasmen.go.id/katalog/buku-kurikulum-merdeka" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Lihat di SIBI <Icon name="arrowRight" size={16} />
          </a>
          <Mascot size={116} className="absolute bottom-2 right-8 hidden sm:block" />
        </div>

        {/* grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((b) => (
            <Card key={b.id} hover className="overflow-hidden">
              <div className="relative h-48 w-full bg-sl-50">
                {b.coverImage ? (
                  <Image src={b.coverImage} alt={b.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-contain p-3" />
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ backgroundColor: b.cover }}>
                    <Icon name="bookOpen" size={34} className="text-white/90" />
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: b.cover }}>
                  {b.grade}
                </span>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 min-h-[40px] font-display text-[14px] font-bold leading-snug text-ink">{b.title}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {b.subject}
                  {b.author ? ` · ${b.author.split(";")[0].split(",")[0]}` : ""}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-text">
                    <Icon name="star" size={12} className="text-accent" /> {b.rating}
                  </span>
                  {b.pages && <span className="text-[10px] text-subtle">· {b.pages} hal</span>}
                  <span className="ml-auto rounded bg-ok-50 px-1.5 py-0.5 text-[9px] font-bold text-ok-dark">SIBI</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <Link href={`/student/reader?book=${b.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-50 py-2 text-xs font-bold text-primary-dark hover:bg-primary-100">
                    <Icon name="eye" size={14} /> Baca
                  </Link>
                  <a href={b.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg bg-sl-50 px-3 py-2 text-xs font-bold text-text hover:bg-sl-100" title="Unduh PDF lengkap">
                    <Icon name="download" size={14} />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {list.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted">Tidak ada buku yang cocok dengan filter.</Card>
        )}
      </div>
    </AppShell>
  );
}
