"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Card, Pill, Avatar } from "@/components/ui";
import { SUBJECTS, SUBJECT_LIST, PAPER_LABELS, PAPER_OPTIONS, paperClass } from "@/lib/subjects";
import { recognize, averageConfidence } from "@/lib/ocr";
import { boardBookForSubject } from "@/lib/books-sd";
import type { Board, PaperKind } from "@/lib/types";
import { cn } from "@/lib/cn";

// ------------------------------------------------------------------ helper
const DEFAULT_PAGES = 3;

function pageKey(subject: string, n: number) {
  return `sisakti.board.${subject}.p${n}`;
}

export function SubjectTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUBJECT_LIST.map((s) => {
        const on = s.key === active;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-colors",
              on ? "border-transparent text-white" : "border-line bg-white text-text hover:border-primary-200",
            )}
            style={on ? { backgroundColor: s.color } : undefined}
          >
            <Icon name="bookOpen" size={15} style={on ? { color: "white" } : { color: s.color }} />
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

export function PaperSelector({
  value,
  onChange,
}: {
  value: PaperKind;
  onChange: (p: PaperKind) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PAPER_OPTIONS.map((p) => {
        const on = p === value;
        return (
          <button
            key={p}
            onClick={() => onChange(p as PaperKind)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors",
              on ? "bg-primary text-white" : "bg-sl-50 text-muted hover:bg-primary-50",
            )}
          >
            {PAPER_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ Student board
export function InteractiveBoard({
  initial,
  taskTitle,
  studentName = "Saya",
  initials = "SW",
  color = "#1e88e5",
}: {
  initial: Board;
  taskTitle?: string;
  studentName?: string;
  initials?: string;
  color?: string;
}) {
  const [subjectKey, setSubjectKey] = useState("math");
  const [paper, setPaper] = useState<PaperKind>(initial.paper);
  const [status, setStatus] = useState(initial.status);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | undefined>(initial.submittedAt);
  const [activeTool, setActiveTool] = useState(0);

  // ----- notebook pages (per subject) -----
  const [pages, setPages] = useState<string[]>(["", "", ""]);
  const [page, setPage] = useState(0);

  const subject = SUBJECTS[subjectKey];
  const book = useMemo(() => boardBookForSubject(subjectKey), [subjectKey]);

  // load pages for the active subject from localStorage
  useEffect(() => {
    const loaded: string[] = [];
    let i = 0;
    // gather stored pages until a gap (keep at least 3)
    for (; i < 50; i++) {
      let v: string | null = null;
      try { v = localStorage.getItem(pageKey(subjectKey, i)); } catch {}
      if (v === null && i >= DEFAULT_PAGES) break;
      if (v !== null) loaded.push(v);
    }
    while (loaded.length < DEFAULT_PAGES) loaded.push("");
    setPages(loaded);
    setPage(0);
    // reset submit state visually per subject (keep simple)
    setStatus("writing");
    // eslint-disable-next-line
  }, [subjectKey]);

  // persist current page on change
  useEffect(() => {
    try {
      if (pages[page] !== undefined) localStorage.setItem(pageKey(subjectKey, page), pages[page]);
    } catch {}
    // eslint-disable-next-line
  }, [pages, page, subjectKey]);

  const text = pages[page] ?? "";
  const accuracy = useMemo(() => averageConfidence(recognize(text, subjectKey.length)), [text, subjectKey]);
  const filledPages = pages.filter((p) => p.trim().length > 0).length;
  const total = pages.length;

  function setText(v: string) {
    setPages((prev) => {
      const next = [...prev];
      next[page] = v;
      return next;
    });
  }
  function changeSubject(k: string) {
    setSubjectKey(k);
    setPaper(SUBJECTS[k].paper);
    setActiveTool(0);
  }
  function addPage() {
    setPages((prev) => [...prev, ""]);
    setPage(pages.length);
  }
  function deletePage(idx: number) {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== idx));
    setPage((p) => (idx < p ? p - 1 : Math.min(p, pages.length - 2)));
  }

  async function submit() {
    setBusy(true);
    try {
      const combined = pages.map((p) => p.trim()).filter(Boolean).join("\n");
      const res = await fetch(`/api/boards/${initial.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: combined, strokes: Math.max(6, combined.length), seed: subjectKey.length }),
      });
      const data = await res.json();
      setStatus(data.board.status);
      setSavedAt(data.board.submittedAt);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <SubjectTabs active={subjectKey} onChange={changeSubject} />

      <div className="grid gap-4 xl:grid-cols-2">
        {/* ================= LEFT: Notebook (multi-halaman) ================= */}
        <div className="space-y-4">
          <Card className="p-5">
            {/* notebook header */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={initials} color={color} size={36} />
                <div>
                  <p className="font-display text-sm font-bold text-ink">Buku Tulis: {studentName}</p>
                  <p className="text-[11px] font-medium text-muted">
                    {subject.name} · {PAPER_LABELS[paper]} · {filledPages}/{total} halaman terisi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted">Kertas:</span>
                <PaperSelector value={paper} onChange={setPaper} />
              </div>
            </div>

            {/* notebook body: single flexible page + compact page navigation */}
            <div className="min-w-0">
              <div className={cn("relative h-[340px] w-full overflow-hidden rounded-xl border border-line", paperClass(paper))}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Tulis di halaman ${page + 1}…`}
                  spellCheck={false}
                  className="handwriting absolute inset-0 h-full w-full resize-none bg-transparent p-5 text-2xl leading-[32px] outline-none placeholder:font-sans placeholder:text-base placeholder:text-subtle"
                  style={{ color: subject.color }}
                />
                <div className="pointer-events-none absolute bottom-2 right-3 rounded-md bg-white/80 px-2 py-1 text-[10px] font-semibold text-muted">
                  Hal. {page + 1} / {total} · {PAPER_LABELS[paper]}
                </div>
              </div>

              {/* compact page navigation (no thumbnails) */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 rounded-lg bg-sl-50 px-3 py-1.5 text-[11px] font-bold text-text disabled:opacity-40"
                >
                  <Icon name="chevronLeft" size={14} /> Sebelumnya
                </button>
                <select
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-bold text-ink outline-none focus:ring-2 focus:ring-primary/30"
                  title="Lompat ke halaman"
                >
                  {pages.map((pg, i) => (
                    <option key={i} value={i}>
                      Halaman {i + 1}{pg.trim() ? " •" : ""}
                    </option>
                  ))}
                </select>
                {page < total - 1 ? (
                  <button
                    onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
                    className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-[11px] font-bold text-primary-dark"
                  >
                    Berikutnya <Icon name="chevronRight" size={14} />
                  </button>
                ) : (
                  <button
                    onClick={addPage}
                    className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-[11px] font-bold text-primary-dark"
                  >
                    <Icon name="plus" size={14} /> Halaman Baru
                  </button>
                )}
                <button
                  onClick={addPage}
                  className="ml-auto flex items-center gap-1 rounded-lg bg-sl-50 px-3 py-1.5 text-[11px] font-bold text-text hover:bg-sl-100"
                  title="Tambah halaman"
                >
                  <Icon name="plus" size={14} /> Tambah Halaman
                </button>
                {total > 1 && (
                  <button
                    onClick={() => deletePage(page)}
                    className="flex items-center gap-1 rounded-lg bg-danger-50 px-3 py-1.5 text-[11px] font-bold text-danger-dark hover:bg-danger-100"
                    title="Hapus halaman ini"
                  >
                    <Icon name="trash" size={13} /> Hapus
                  </button>
                )}
              </div>
            </div>

            {text && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-ok-50 px-4 py-3">
                <Icon name="checkCircle" size={18} className="text-ok-dark" />
                <span className="text-[11px] font-bold text-ok-dark">Halaman ini terbaca:</span>
                <span className="truncate text-sm font-semibold text-text">“{text}”</span>
              </div>
            )}
          </Card>

          {/* adaptive toolbar */}
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: subject.color + "22" }}>
                <Icon name="bookOpen" size={16} style={{ color: subject.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">Toolbar {subject.name}</p>
                <p className="text-[10px] font-medium text-muted">Menyesuaikan mata pelajaran</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subject.tools.map((t, i) => {
                const on = i === activeTool;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(i)}
                    className={cn(
                      "flex w-[66px] flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-semibold transition-colors",
                      on ? "text-ink" : "bg-sl-50 text-text hover:bg-sl-50/70",
                    )}
                    style={on ? { backgroundColor: subject.color + "22", color: subject.color } : undefined}
                  >
                    <Icon name={t.id} size={18} style={{ color: on ? subject.color : "#64748b" }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* submit bar */}
          <Card className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                <Icon name="scan" size={17} className="text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink">Kirim seluruh buku · Akurasi {accuracy || 0}%</p>
                <p className="text-[10px] font-medium text-muted">
                  {status === "graded"
                    ? "Sudah dinilai guru"
                    : status === "submitted"
                      ? `Terkirim ke guru${savedAt ? ` · ${savedAt}` : ""}`
                      : `${filledPages} halaman siap dikirim`}
                </p>
              </div>
            </div>
            <button
              onClick={submit}
              disabled={busy || filledPages === 0 || status === "graded"}
              className="ml-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              <Icon name="send" size={15} />
              {status === "graded" ? "Sudah dinilai" : busy ? "Mengirim…" : "Kirim ke Guru"}
            </button>
          </Card>

          {taskTitle && (
            <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3">
              <Icon name="clipboardList" size={16} className="text-primary-dark" />
              <span className="text-[11px] font-bold text-primary-dark">Tugas aktif:</span>
              <span className="text-xs font-semibold text-text">{taskTitle}</span>
            </div>
          )}
        </div>

        {/* ================= RIGHT: Buku pelajaran (1 buku per mapel, PDF inline) ================= */}
        <Card className="flex min-h-[600px] flex-col p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
              <Icon name="libraryBig" size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-ink">Buku Pelajaran · {subject.name}</p>
              <p className="truncate text-[11px] font-medium text-muted">
                {book ? `${book.title} · ${book.grade}` : "Buku SIBI"}
              </p>
            </div>
            <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e" className="ml-auto hidden sm:inline-flex">SIBI</Pill>
          </div>

          <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-line bg-sl-50">
            {book?.pdfUrl ? (
              <iframe
                key={book.id}
                src={`${book.pdfUrl}#view=FitH`}
                title={book.title}
                className="h-full min-h-[520px] w-full"
              />
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-2 text-center">
                <Icon name="fileText" size={40} className="text-subtle" />
                <p className="text-sm font-semibold text-ink">Belum ada buku untuk mapel ini</p>
              </div>
            )}
          </div>

          {book && (
            <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-muted">
              <span className="truncate pr-2">
                {book.author ? `Penulis: ${book.author.split(",")[0]}` : book.subject}
                {book.isbn ? ` · ISBN ${book.isbn}` : ""}
              </span>
              <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-1 font-bold text-primary">
                <Icon name="download" size={12} /> Unduh
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
