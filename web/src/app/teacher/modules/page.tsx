"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, Progress } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { siswaBooks as books } from "@/lib/books-sd";
import { cn } from "@/lib/cn";

export default function ModulesPage() {
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [chapters, setChapters] = useState<{ title: string; subs: string[] }[]>([]);

  function simulate() {
    setUploaded("Matematika_VIII_SIBI.pdf");
    setExtracting(true);
    setChapters([]);
    setTimeout(() => {
      setChapters([
        { title: "Bab 4 · Bangun Ruang Sisi Datar", subs: ["Kubus & Balok", "Prisma", "Limas", "Glosarium"] },
        { title: "Bab 5 · Statistika", subs: ["Mean, Median, Modus", "Penyajian Data"] },
      ]);
      setExtracting(false);
    }, 1200);
  }

  return (
    <AppShell role="teacher" title="Modul & Materi" subtitle="Ekstraksi PDF buku SIBI menjadi bahan ajar & kuis">
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        {/* material extractor */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Icon name="fileScan" size={20} className="text-primary" />
            <p className="font-display text-base font-bold text-ink">PDF Material Extractor</p>
            <Pill bg="#ede9fe" fg="#8b5cf6">Simulator</Pill>
          </div>
          <p className="mt-1 text-sm text-muted">Unggah PDF buku SIBI → struktur bab, sub-bab, glosarium, & draf kuis otomatis.</p>

          <button
            onClick={simulate}
            className="mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 py-10 text-center hover:bg-primary-50"
          >
            <Icon name="cloudDownload" size={34} className="text-primary" />
            <span className="text-sm font-bold text-primary-dark">{uploaded ?? "Klik untuk unggah PDF buku SIBI"}</span>
            <span className="text-[11px] text-muted">PDF · maks 50 MB</span>
          </button>

          {extracting && (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <Icon name="refresh" size={16} className="animate-spin" /> Mengekstrak struktur & glosarium…
            </div>
          )}

          {chapters.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold text-muted">Struktur terdeteksi</p>
              {chapters.map((c) => (
                <div key={c.title} className="rounded-xl border border-line p-3">
                  <p className="text-sm font-bold text-ink">{c.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.subs.map((s) => (
                      <span key={s} className="rounded-md bg-sl-50 px-2 py-1 text-[11px] font-semibold text-text">{s}</span>
                    ))}
                  </div>
                  <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-bold text-white">
                    <Icon name="brain" size={13} /> Buat draf kuis
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* book library */}
        <Card className="p-5">
          <p className="font-display text-sm font-bold text-ink">Buku SIBI Anda</p>
          <div className="mt-3 space-y-2">
            {books.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl bg-sl-50 p-2.5">
                <div className="flex h-10 w-8 items-center justify-center rounded" style={{ backgroundColor: b.cover }}>
                  <Icon name="bookOpen" size={16} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-ink">{b.title}</p>
                  <p className="text-[10px] text-muted">{b.grade} · {b.pages} hal</p>
                </div>
                <Icon name="chevronRight" size={16} className="text-subtle" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
