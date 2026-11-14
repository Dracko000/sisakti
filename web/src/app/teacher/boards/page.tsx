"use client";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, Avatar, Progress } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { SUBJECTS, paperClass } from "@/lib/subjects";
import type { Board } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATUS_META: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  empty: { label: "Kosong", bg: "#f1f5f9", fg: "#64748b", dot: "#94a3b8" },
  writing: { label: "Menulis", bg: "#fff3e0", fg: "#b45309", dot: "#ff9800" },
  submitted: { label: "Menunggu", bg: "#fff3e0", fg: "#b45309", dot: "#ff9800" },
  graded: { label: "Dinilai", bg: "#dcfce7", fg: "#15803d", dot: "#22c55e" },
};

export default function TeacherBoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scores, setScores] = useState({ akurasi: 96, proses: 90, penulisan: 88 });
  const [feedback, setFeedback] = useState("Langkah sudah tepat! Tinggal tulis satuan cm3 dengan benar ya. Bagus!");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/boards");
    const d = await res.json();
    setBoards(d.boards);
    if (!selectedId && d.boards.length) setSelectedId(d.boards[0].id);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const selected = boards.find((b) => b.id === selectedId) ?? null;
  const subject = selected ? SUBJECTS[selected.subjectKey] : SUBJECTS.math;
  const avg = Math.round((scores.akurasi + scores.proses + scores.penulisan) / 3);
  const finalScore = selected?.grade?.score ?? avg;
  const gradeLetter = finalScore >= 90 ? "A" : finalScore >= 80 ? "B+" : finalScore >= 70 ? "B" : "C";

  const stats = useMemo(() => {
    const graded = boards.filter((b) => b.status === "graded");
    const pending = boards.filter((b) => b.status === "submitted");
    const avg = graded.length ? Math.round(graded.reduce((a, b) => a + (b.grade?.score ?? 0), 0) / graded.length) : 0;
    return { graded: graded.length, pending: pending.length, total: boards.length, avg };
  }, [boards]);

  async function save(scoreArg?: number) {
    if (!selected) return;
    setSaving(true);
    try {
      const score = scoreArg ?? avg;
      const res = await fetch(`/api/boards/${selected.id}/grade`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          score,
          grade: score >= 90 ? "A" : score >= 80 ? "B+" : score >= 70 ? "B" : "C",
          rubric: [
            { label: "Akurasi", value: scores.akurasi },
            { label: "Proses", value: scores.proses },
            { label: "Penulisan", value: scores.penulisan },
          ],
          feedback,
        }),
      });
      const d = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === d.board.id ? d.board : b)));
    } finally {
      setSaving(false);
    }
  }

  async function autoGrade() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/boards/${selected.id}/autograde`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ score: Math.min(100, avg + 1) }),
      });
      const d = await res.json();
      setBoards((prev) => prev.map((b) => (b.id === d.board.id ? d.board : b)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell role="teacher" title="Papan & Nilai Tulis" subtitle="Tinjau & nilai papan interaktif siswa">
      {/* summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ok-50"><Icon name="checkCircle" size={20} className="text-ok-dark" /></div>
          <div><p className="text-xs text-muted">Sudah dinilai</p><p className="font-display text-xl font-bold text-ink">{stats.graded} / {stats.total}</p></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50"><Icon name="clock" size={20} className="text-amber-700" /></div>
          <div><p className="text-xs text-muted">Menunggu</p><p className="font-display text-xl font-bold text-ink">{stats.pending}</p></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><Icon name="penLine" size={20} className="text-primary" /></div>
          <div><p className="text-xs text-muted">Rata-rata nilai papan</p><p className="font-display text-xl font-bold text-ink">{stats.avg || "—"}</p></div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        {/* queue */}
        <Card className="flex max-h-[720px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line-2 px-4 py-3">
            <p className="font-display text-sm font-bold text-ink">Antrean Papan</p>
            <Pill bg="#fff3e0" fg="#b45309" dot="#ff9800">{stats.pending} menunggu</Pill>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {boards.length === 0 && (
              <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
                <Icon name="penLine" size={28} className="text-subtle" />
                <p className="text-xs text-muted">Belum ada papan siswa.</p>
                <p className="text-[10px] text-subtle">Papan muncul setelah siswa mengirim tulisan.</p>
              </div>
            )}
            {boards.map((b) => {
              const m = STATUS_META[b.status];
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={cn("flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors", selectedId === b.id ? "bg-primary-50" : "hover:bg-sl-50")}
                >
                  <Avatar initials={b.initials} color={b.color} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{b.studentName}</p>
                    <p className="text-[10px] text-muted">Papan #{b.subjectKey === "math" ? "4" : "—"} · {b.submittedAt ?? "—"}</p>
                  </div>
                  <span className="rounded-lg px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: m.bg, color: m.fg }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* detail + grading */}
        {selected ? (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar initials={selected.initials} color={selected.color} size={42} />
                  <div>
                    <p className="font-display text-sm font-bold text-ink">Papan Interaktif · {selected.studentName}</p>
                    <p className="text-[11px] text-muted">{subject.name} · {subject.paperLabel} · dikumpulkan {selected.submittedAt ?? "—"}</p>
                  </div>
                </div>
                <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: STATUS_META[selected.status].bg, color: STATUS_META[selected.status].fg }}>
                  {STATUS_META[selected.status].label}
                </span>
              </div>

              {/* board render */}
              <div className={cn("relative h-[150px] rounded-xl border border-line p-4", paperClass(selected.paper))}>
                <p className="handwriting text-3xl text-primary break-words">{selected.recognizedText || "(belum ada tulisan)"}</p>
              </div>

              {/* transcription readout (tanpa tampilan per-huruf) */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-ok-50 p-4">
                <Icon name="checkCircle" size={18} className="shrink-0 text-ok-dark" />
                <span className="text-[11px] font-bold text-ok-dark">Tulisan terbaca otomatis:</span>
                <span className="truncate text-sm font-semibold text-text">“{selected.recognizedText || "belum ada tulisan"}”</span>
              </div>
            </Card>

            {/* grading card */}
            <Card className="p-5">
              <p className="font-display text-sm font-bold text-ink">Penilaian Guru</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {([["akurasi", "Akurasi"], ["proses", "Proses"], ["penulisan", "Penulisan"]] as const).map(([key, label]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-text">
                      <span>{label}</span><span className="font-bold text-ink">{scores[key]}</span>
                    </div>
                    <input
                      type="range" min={40} max={100} value={scores[key]}
                      onChange={(e) => setScores((s) => ({ ...s, [key]: Number(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold text-text">Umpan balik</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-line bg-sl-50 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-ok-50 p-4">
                <div>
                  <p className="text-[11px] font-bold text-ok-dark">Nilai Akhir</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl font-bold text-ok-dark">{finalScore}</span>
                    <span className="rounded-lg bg-white px-2.5 py-0.5 font-display text-base font-bold text-ok-dark">{gradeLetter}</span>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button onClick={autoGrade} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary-dark disabled:opacity-50">
                    <Icon name="zap" size={14} /> Nilai Otomatis
                  </button>
                  <button onClick={() => save()} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                    <Icon name="check" size={14} /> {saving ? "Menyimpan…" : "Simpan Nilai"}
                  </button>
                </div>
              </div>

              {selected.grade && (
                <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-ok-dark">
                  <Icon name="badgeCheck" size={15} /> Sudah dinilai {selected.grade.score} oleh {selected.grade.gradedBy}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="flex items-center justify-center p-16 text-sm text-muted">Pilih papan siswa untuk dinilai.</Card>
        )}
      </div>
    </AppShell>
  );
}
