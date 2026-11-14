"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Progress, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/cn";

const QUESTIONS = [
  { q: "Sebuah kubus memiliki rusuk 8 cm. Berapakah volumenya?", opts: ["512 cm³", "384 cm³", "256 cm³", "64 cm³"], a: 0 },
  { q: "Luas permukaan kubus dengan rusuk 5 cm adalah…", opts: ["125 cm²", "150 cm²", "100 cm²", "25 cm²"], a: 1 },
  { q: "Banyak rusuk pada sebuah balok adalah…", opts: ["6", "8", "12", "16"], a: 2 },
];

export default function QuizPage() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUESTIONS[i];

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.a) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 < QUESTIONS.length) {
      setI(i + 1);
      setPicked(null);
    } else setDone(true);
  }

  return (
    <AppShell role="student" title="Kuis & Latihan" subtitle="Uji pemahamanmu per bab — Matematika VIII">
      <div className="mx-auto max-w-3xl">
        {!done ? (
          <Card className="p-7">
            <div className="flex items-center justify-between">
              <Pill bg="#e3f0fc" fg="#0d47a1">Soal {i + 1} dari {QUESTIONS.length}</Pill>
              <span className="text-xs font-bold text-muted">Skor: {score}</span>
            </div>
            <Progress value={((i) / QUESTIONS.length) * 100} className="mt-3" />
            <h2 className="mt-6 font-display text-xl font-bold text-ink">{q.q}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {q.opts.map((o, idx) => {
                const isPicked = picked === idx;
                const isCorrect = idx === q.a;
                let cls = "border-line bg-white hover:border-primary-200";
                if (picked !== null) {
                  if (isCorrect) cls = "border-ok bg-ok-50";
                  else if (isPicked) cls = "border-danger bg-danger-50";
                  else cls = "border-line bg-white opacity-60";
                }
                return (
                  <button key={o} onClick={() => choose(idx)} className={cn("flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold text-text", cls)}>
                    {o}
                    {picked !== null && isCorrect && <Icon name="checkCircle" size={18} className="text-ok-dark" />}
                    {picked !== null && isPicked && !isCorrect && <Icon name="circleX" size={18} className="text-danger" />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={next}
              disabled={picked === null}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {i + 1 < QUESTIONS.length ? "Soal berikutnya" : "Selesai"} <Icon name="arrowRight" size={16} />
            </button>
          </Card>
        ) : (
          <Card className="flex flex-col items-center p-10 text-center">
            <Mascot size={120} />
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">Kuis selesai!</h2>
            <p className="mt-1 text-sm text-muted">Skor kamu</p>
            <p className="mt-2 font-display text-5xl font-bold text-primary">{Math.round((score / QUESTIONS.length) * 100)}</p>
            <p className="mt-1 text-sm text-muted">{score} dari {QUESTIONS.length} soal benar</p>
            <button
              onClick={() => { setI(0); setPicked(null); setScore(0); setDone(false); }}
              className="mt-5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              Ulangi Kuis
            </button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
