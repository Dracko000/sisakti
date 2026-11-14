import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { Card, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { sibiBooksSD } from "@/lib/books-sd";

export default function AdminCatalog() {
  return (
    <AppShell role="admin" title="Katalog SIBI" subtitle="Sinkronisasi & kelola perbukuan SIBI (SD/MI)">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-dark p-5 text-white">
        <div>
          <p className="font-display text-lg font-bold">Sinkronisasi Katalog SIBI</p>
          <p className="text-sm text-primary-100">
            {sibiBooksSD.length} buku SD/MI Kurikulum Merdeka tersinkron dari Sistem Informasi Perbukuan Indonesia
          </p>
        </div>
        <a href="https://buku.kemendikdasmen.go.id/katalog/buku-kurikulum-merdeka" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary-dark">
          <Icon name="refresh" size={16} /> Buka SIBI
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sibiBooksSD.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="relative h-40 bg-sl-50">
              {b.coverImage ? (
                <Image src={b.coverImage} alt={b.title} fill sizes="25vw" className="object-contain p-2" />
              ) : (
                <div className="flex h-full items-center justify-center" style={{ backgroundColor: b.cover }}>
                  <Icon name="bookOpen" size={28} className="text-white" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-[13px] font-bold text-ink">{b.title}</p>
              <p className="mt-0.5 text-[11px] text-muted">{b.subject} · {b.grade}</p>
              <div className="mt-2"><Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">Tersinkron</Pill></div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
