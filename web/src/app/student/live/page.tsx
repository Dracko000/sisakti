"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Avatar, Pill } from "@/components/ui";
import { cn } from "@/lib/cn";

const POLL: { label: string; pct: number; correct: boolean }[] = [];
const LEADER: { rank: string; name: string; score: number; color: string }[] = [];

export default function StudentLivePage() {
  const [raised, setRaised] = useState(false);
  const [msgs, setMsgs] = useState<{ name: string; text: string; teacher: boolean }[]>([]);
  const [draft, setDraft] = useState("");
  const [voted, setVoted] = useState<number | null>(null);

  function send() {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { name: "Saya", text: draft, teacher: false }]);
    setDraft("");
  }

  return (
    <AppShell role="student" title="Matematika VIII — Bangun Ruang" subtitle="Kelas live">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* stage */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-ink-2 p-1">
            <div className="relative flex h-[300px] items-center justify-center rounded-xl bg-ink">
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
                <Pill bg="#ef4444" fg="#fff" dot="#fff">LIVE</Pill>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-white">42:15</span>
              </div>
              <div className="text-center">
                <Avatar initials="RN" color="#1e88e5" size={88} className="mx-auto" />
                <p className="mt-3 font-display text-lg font-bold text-white">Guru</p>
                <p className="text-xs text-slate-400">Kelas live</p>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                {["mic", "video", "screenShare"].map((ic, i) => (
                  <span key={ic} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", i === 0 ? "bg-ok text-white" : "bg-white/10 text-white")}>
                    <Icon name={ic} size={17} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* personal board preview + raise hand */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-ink">Papanku · Matematika</p>
                <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">Terbaca</Pill>
              </div>
              <div className="paper-grid h-[170px] rounded-lg border border-line p-3">
                <p className="handwriting text-2xl text-primary">V = s x s x s</p>
                <p className="handwriting text-2xl text-accent-dark">= 512 cm3</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setRaised((r) => !r)}
                className={cn("flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-colors", raised ? "bg-accent text-white" : "bg-white text-text card-shadow hover:bg-sl-50")}
              >
                <Icon name="hand" size={20} /> {raised ? "Tangan terangkat ✓" : "Angkat Tangan"}
              </button>
              <div className="rounded-2xl bg-white p-4 card-shadow">
                <p className="text-xs font-bold text-ink">Polling</p>
                <p className="mt-1 text-[13px] font-semibold text-text">Volume kubus rusuk 8 cm?</p>
                <div className="mt-2 space-y-1.5">
                  {POLL.map((o, i) => (
                    <button
                      key={o.label}
                      onClick={() => setVoted(i)}
                      className={cn("relative w-full overflow-hidden rounded-lg px-2.5 py-1.5 text-left text-[11px] font-bold text-white", o.correct ? "bg-ok" : "bg-slate-600")}
                      style={{ opacity: voted === null ? 0.92 : voted === i ? 1 : 0.5 }}
                    >
                      <span className="relative z-10">{o.label}</span>
                      <span className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2">{o.pct}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* side: chat + leaderboard */}
        <div className="space-y-4">
          <div className="flex h-[420px] flex-col rounded-2xl bg-ink-2 p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-white">Diskusi Kelas</p>
              <Pill bg="#1e293b" fg="#94a3b8">{msgs.length} pesan</Pill>
            </div>
            <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
              {msgs.map((m, i) => (
                <div key={i}>
                  <p className={cn("text-[11px] font-bold", m.teacher ? "text-primary-200" : "text-accent-100")}>{m.name}</p>
                  <p className="text-[12px] text-slate-300">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-ink px-3 py-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tulis pesan…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
              <button onClick={send} className="text-primary"><Icon name="send" size={15} /></button>
            </div>
          </div>

          <div className="rounded-2xl bg-ink-2 p-4">
            <div className="flex items-center gap-2">
              <Icon name="trophy" size={16} className="text-accent" />
              <p className="font-display text-sm font-bold text-white">Papan Peringkat Kuis</p>
            </div>
            <div className="mt-3 space-y-2">
              {LEADER.map((r) => (
                <div key={r.rank} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-ink" style={{ backgroundColor: r.color }}>{r.rank}</span>
                  <span className="text-[13px] font-semibold text-white">{r.name}</span>
                  <span className="ml-auto text-[13px] font-bold text-accent">{r.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
