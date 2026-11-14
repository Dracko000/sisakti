import { AppShell } from "@/components/AppShell";
import { Card, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";

const WEEKS = [
  { w: "Pekan 1", topic: "Kubus & Balok — sifat & jaring-jaring", status: "Selesai" },
  { w: "Pekan 2", topic: "Prisma — luas permukaan", status: "Selesai" },
  { w: "Pekan 3", topic: "Limas — volume", status: "Berjalan" },
  { w: "Pekan 4", topic: "Evaluasi Bab 4 (Papan + Kuis)", status: "Rencana" },
];

export default function RppPage() {
  return (
    <AppShell role="teacher" title="RPP / Silabus Digital" subtitle="Penjadwalan materi per minggu · Matematika VIII">
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Icon name="scrollText" size={20} className="text-primary" />
          <p className="font-display text-base font-bold text-ink">Rencana Pelaksanaan Pembelajaran</p>
        </div>
        <div className="mt-5 space-y-3">
          {WEEKS.map((k) => (
            <div key={k.w} className="flex items-center gap-4 rounded-xl border border-line p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary-dark">
                {k.w.split(" ")[1]}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-ink">{k.topic}</p>
                <p className="text-[11px] text-muted">{k.w}</p>
              </div>
              <Pill
                bg={k.status === "Selesai" ? "#dcfce7" : k.status === "Berjalan" ? "#fff3e0" : "#f1f5f9"}
                fg={k.status === "Selesai" ? "#15803d" : k.status === "Berjalan" ? "#b45309" : "#64748b"}
              >
                {k.status}
              </Pill>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
