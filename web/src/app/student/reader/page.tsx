"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Pill } from "@/components/ui";
import { sibiBooksSD, getBookById } from "@/lib/books-sd";
import { cn } from "@/lib/cn";

function ReaderInner() {
  const sp = useSearchParams();
  const id = sp.get("book");
  const book = (id && getBookById(id)) || sibiBooksSD.find((b) => b.subject === "Matematika") || sibiBooksSD[0];
  const [dark, setDark] = useState(false);

  return (
    <div className={cn("flex h-screen flex-col", dark ? "bg-ink" : "bg-sl-50")}>
      {/* top bar */}
      <header className={cn("flex h-16 shrink-0 items-center gap-3 border-b px-4", dark ? "border-white/10 bg-ink-2" : "border-line bg-white")}>
        <Link href="/student/library" className={cn("rounded-lg p-1.5", dark ? "hover:bg-white/10" : "hover:bg-sl-50")} title="Kembali ke katalog">
          <Icon name="arrowLeft" size={22} className={dark ? "text-white" : "text-text"} />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <Icon name="bookOpen" size={20} />
        </div>
        <div className="min-w-0">
          <p className={cn("truncate text-sm font-bold", dark ? "text-white" : "text-ink")}>{book.title}</p>
          <p className="truncate text-[11px] text-muted">
            {book.subject} · {book.grade} · {book.isbn || "SIBI"} {book.author ? `· ${book.author.split(",")[0]}` : ""}
          </p>
        </div>
        <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e" className="ml-2 hidden sm:inline-flex">SIBI · PDF lengkap</Pill>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setDark((d) => !d)} className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", dark ? "border-white/10 text-white" : "border-line bg-white text-text")} title="Mode gelap/terang">
            <Icon name={dark ? "sun" : "moon"} size={17} />
          </button>
          <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white" title="Buka / unduh PDF">
            <Icon name="download" size={15} /> Unduh PDF
          </a>
        </div>
      </header>

      {/* pdf viewer */}
      <main className="relative flex-1">
        {book.pdfUrl ? (
          <iframe
            src={`${book.pdfUrl}#view=FitH`}
            title={book.title}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Icon name="fileText" size={44} className="text-subtle" />
            <p className="font-display text-base font-bold text-ink">PDF tidak tersedia untuk buku ini</p>
            <a href={book.pdfUrl || "#"} className="text-sm font-bold text-primary">Buka sumber SIBI</a>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted">Memuat pembaca…</div>}>
      <ReaderInner />
    </Suspense>
  );
}
