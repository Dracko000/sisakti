"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, Avatar, Progress, BarChart } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { GradeRow } from "@/lib/types";

export default function GradebookPage() {
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [summary, setSummary] = useState<{ collected: string; average: string; tuntas: string; ungraded: number } | null>(null);
  const [tab, setTab] = useState("Tugas");

  useEffect(() => {
    fetch("/api/gradebook").then((r) => r.json()).then((d) => { setRows(d.rows); setSummary(d.summary); });
  }, []);

  const avgOf = (r: GradeRow) => Math.round((r.t1 + r.t2 + r.quiz + r.uts + r.board) / 5);

  return (
    <AppShell role="teacher" title="Buku Nilai Digital" subtitle="Matematika VIII-A · Semester Ganjil 2025/2026">
      <div className="space-y-5">
        {/* tabs + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["Tugas", "Kuis", "UTS", "UAS", "Rekap Akhir"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={t === tab ? "rounded-lg bg-primary px-4 py-2 text-[13px] font-bold text-white" : "rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-semibold text-muted"}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2 text-xs font-bold text-text"><Icon name="download" size={15} /> Ekspor</button>
            <button className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white"><Icon name="plus" size={15} /> Tugas</button>
          </div>
        </div>

        {/* summary */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Tugas Terkumpul", summary.collected, "#1e88e5", "clipboardList"],
              ["Rata-rata Kelas", summary.average, "#15803d", "chartColumn"],
              ["Tuntas (KKM 75)", summary.tuntas, "#b45309", "badgeCheck"],
              ["Belum Dinilai", String(summary.ungraded), "#b91c1c", "clock"],
            ].map(([label, val, color, ic]) => (
              <Card key={label as string} className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: color + "22" }}>
                  <Icon name={ic as string} size={20} style={{ color }} />
                </div>
                <div><p className="text-xs text-muted">{label}</p><p className="font-display text-lg font-bold text-ink">{val}</p></div>
              </Card>
            ))}
          </div>
        )}

        {/* table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-sl-50 text-left text-xs font-bold text-muted">
                  <th className="px-5 py-3">Nama Siswa</th>
                  <th className="px-3 py-3 text-center">T1</th>
                  <th className="px-3 py-3 text-center">T2</th>
                  <th className="px-3 py-3 text-center">Kuis</th>
                  <th className="px-3 py-3 text-center">UTS</th>
                  <th className="px-3 py-3 text-center">Papan</th>
                  <th className="px-5 py-3">Rata-rata</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const a = avgOf(r);
                  const tuntas = a >= 75;
                  return (
                    <tr key={r.studentId} className="border-t border-line-2 hover:bg-sl-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={r.initials} color={r.color} size={32} />
                          <span className="font-semibold text-ink">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-text">{r.t1}</td>
                      <td className="px-3 py-3 text-center text-text">{r.t2}</td>
                      <td className="px-3 py-3 text-center text-text">{r.quiz}</td>
                      <td className="px-3 py-3 text-center text-text">{r.uts}</td>
                      <td className="px-3 py-3 text-center font-semibold text-primary-dark">{r.board}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={a} color={tuntas ? "#22c55e" : "#ef4444"} className="w-[70px]" height={7} />
                          <span className="text-xs font-bold text-ink">{a}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Pill bg={tuntas ? "#dcfce7" : "#fee2e2"} fg={tuntas ? "#15803d" : "#b91c1c"}>
                          {tuntas ? "Tuntas" : "Remedial"}
                        </Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <p className="font-display text-sm font-bold text-ink">Distribusi Nilai UTS</p>
            <p className="mb-3 text-[11px] text-muted">Sebaran nilai {rows.length} siswa</p>
            {rows.length ? <BarChart values={rows.map((r) => Math.round((r.t1+r.t2+r.quiz+r.uts+r.board)/5))} color="#1e88e5" /> : <p className="py-10 text-center text-xs text-muted">Belum ada data nilai.</p>}
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2"><Icon name="messageSquare" size={16} className="text-accent" /><p className="font-display text-sm font-bold text-ink">Catatan Evaluasi Kelas</p></div>
            <div className="mt-3 rounded-xl bg-sl-50 p-3 text-[12.5px] leading-relaxed text-text">
              Catatan evaluasi kelas akan muncul di sini setelah ada penilaian.
            </div>
            <p className="mt-2 text-[11px] text-subtle">Dari sistem evaluasi kelas · <span className="font-bold text-primary">Edit catatan</span></p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
