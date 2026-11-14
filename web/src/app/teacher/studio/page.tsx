"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Avatar, Pill, Progress } from "@/components/ui";
import { paperClass, SUBJECTS } from "@/lib/subjects";
import type { Board } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function StudioPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState(92);

  useEffect(() => {
    fetch("/api/boards").then((r) => r.json()).then((d) => {
      setBoards(d.boards);
      const first = d.boards.find((b: Board) => b.status === "submitted" || b.status === "graded");
      setSelectedId(first?.id ?? d.boards[0]?.id ?? null);
    });
  }, []);

  const selected = boards.find((b) => b.id === selectedId) ?? null;
  const subject = selected ? SUBJECTS[selected.subjectKey] : SUBJECTS.math;

  async function saveGrade() {
    if (!selected) return;
    const res = await fetch(`/api/boards/${selected.id}/grade`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: finalScore, grade: finalScore >= 90 ? "A" : "B+", rubric: [
        { label: "Akurasi", value: 96 }, { label: "Proses", value: 90 }, { label: "Penulisan", value: 88 },
      ], feedback: "Dinilai dari Studio Live." }),
    });
    const d = await res.json();
    setBoards((prev) => prev.map((b) => (b.id === d.board.id ? d.board : b)));
  }

  return (
    <div className="min-h-screen bg-[#0b1120] p-4 md:p-6">
      {/* top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#0f172a] px-4 py-3 text-white">
        <Link href="/teacher" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><Icon name="arrowLeft" size={18} /></Link>
        <Pill bg="#ef4444" fg="#fff">LIVE</Pill>
        <div>
          <p className="font-display text-sm font-bold">Studio Kelas Live — Matematika VIII-A</p>
          <p className="text-[11px] text-slate-400">Bab 4 · Bangun Ruang · Sesi 12</p>
        </div>
        <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold">42:15</span>
        <div className="ml-auto flex gap-2">
          {["mic", "video", "screenShare"].map((ic, i) => (
            <span key={ic} className={cn("flex h-9 w-9 items-center justify-center rounded-lg", i === 0 ? "bg-ok text-white" : "bg-white/10")}>
              <Icon name={ic} size={16} />
            </span>
          ))}
          <span className="flex h-9 items-center rounded-lg bg-red-600 px-4 text-xs font-bold">Akhiri Sesi</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_460px]">
        {/* board grading */}
        <div className="rounded-2xl bg-[#0f172a] p-5">
          {selected ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar initials={selected.initials} color={selected.color} size={40} />
                  <div>
                    <p className="font-display text-sm font-bold text-white">Papan Interaktif · {selected.studentName}</p>
                    <p className="text-[11px] text-slate-400">{subject.name} · {subject.paperLabel} · {selected.submittedAt ?? "—"}</p>
                  </div>
                </div>
                <Pill bg="#fff3e0" fg="#b45309" dot="#ff9800">{selected.status === "graded" ? "Dinilai" : "Menunggu"}</Pill>
              </div>

              <div className={cn("h-[130px] rounded-xl p-4", paperClass(selected.paper))}>
                <p className="handwriting text-2xl text-primary">{selected.recognizedText || "(belum ada tulisan)"}</p>
              </div>

              <div className="mt-4 rounded-xl bg-[#0b1120] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Penilaian Guru</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold text-ok">92</span>
                    <span className="rounded bg-ok/20 px-2 py-0.5 text-sm font-bold text-ok">A</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[["Akurasi", 96], ["Proses", 90], ["Penulisan", 88]].map(([l, v]) => (
                    <div key={l as string}>
                      <p className="text-[10px] text-slate-400">{l}</p>
                      <p className="font-display text-lg font-bold text-primary-200">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input type="range" min={40} max={100} value={finalScore} onChange={(e) => setFinalScore(Number(e.target.value))} className="flex-1 accent-primary" />
                  <button onClick={saveGrade} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">Simpan Nilai</button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Memuat papan…</p>
          )}
        </div>

        {/* right rail: queue */}
        <div className="rounded-2xl bg-[#0f172a] p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold text-white">Antrean Penilaian Papan</p>
            <Pill bg="#fff3e0" fg="#b45309" dot="#ff9800">{boards.filter((b) => b.status === "submitted").length} menunggu</Pill>
          </div>
          <div className="mt-3 max-h-[420px] space-y-1.5 overflow-y-auto">
            {boards.map((b) => (
              <button key={b.id} onClick={() => setSelectedId(b.id)} className={cn("flex w-full items-center gap-3 rounded-xl p-2.5 text-left", selectedId === b.id ? "bg-[#1e293b]" : "hover:bg-white/5")}>
                <Avatar initials={b.initials} color={b.color} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{b.studentName}</p>
                  <p className="text-[10px] text-slate-400">Papan · {b.submittedAt ?? "—"}</p>
                </div>
                <div className="h-8 w-11 rounded bg-white p-0.5">
                  <p className="handwriting text-[9px] leading-tight text-primary">V=s</p>
                </div>
                <span className={cn("rounded px-2 py-0.5 text-[9px] font-bold", b.status === "graded" ? "bg-ok/20 text-ok" : b.status === "submitted" ? "bg-accent/20 text-accent" : "bg-white/10 text-slate-300")}>
                  {b.status === "graded" ? "Dinilai" : b.status === "submitted" ? "Menunggu" : "Menulis"}
                </span>
              </button>
            ))}
          </div>
          {/* presensi otomatis: belum ada data */}
          <div className="mt-4 rounded-xl bg-[#0b1120] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-white"><Icon name="userCheck" size={14} className="text-primary-200" /> Presensi Otomatis</p>
            <p className="text-[11px] text-slate-400">Belum ada data presensi sesi ini.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
