"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InteractiveBoard } from "@/components/InteractiveBoard";
import { Card } from "@/components/ui";
import { Mascot } from "@/components/Mascot";

export default function StudentBoardPage() {
  const [created, setCreated] = useState(false);

  return (
    <AppShell role="student" title="Papan Interaktif Saya" subtitle="Buku tulis digital multi-halaman — kertas & toolbar menyesuaikan mapel">
      {created ? (
        <InteractiveBoard
          initial={{ id: "draft", studentId: "role-student", studentName: "Saya", initials: "SW", color: "#1e88e5", subjectKey: "math", paper: "grid", status: "writing", strokes: 0, recognizedText: "", letters: [] }}
          taskTitle="Catatan belajarku"
        />
      ) : (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Mascot size={80} />
          <p className="font-display text-base font-bold text-ink">Papan interaktif kamu</p>
          <p className="max-w-md text-sm text-muted">
            Tulis catatan/jawaban di buku tulis digital. Pilih mapel untuk mengganti kertas & toolbar; PDF buku mapel tampil di samping.
            Halaman tersimpan di perangkat ini.
          </p>
          <button
            onClick={() => setCreated(true)}
            className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            Mulai Menulis <span aria-hidden>→</span>
          </button>
        </Card>
      )}
    </AppShell>
  );
}
