import { AppShell } from "@/components/AppShell";
import { Card, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";

const BANK = [
  { q: "Volume kubus rusuk 8 cm?", type: "Pilihan Ganda", diff: "Mudah", a: "512 cm³" },
  { q: "Luas permukaan kubus rusuk 5 cm?", type: "Pilihan Ganda", diff: "Sedang", a: "150 cm²" },
  { q: "Jelaskan perbedaan prisma dan limas.", type: "Esai", diff: "Sulit", a: "—" },
  { q: "Banyak titik sudut balok adalah…", type: "Pilihan Ganda", diff: "Mudah", a: "8" },
];

export default function BankPage() {
  return (
    <AppShell role="teacher" title="Bank Soal" subtitle="Kelola & susun soal dari materi SIBI">
      <div className="mb-4 flex justify-end">
        <button className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white">
          <Icon name="plus" size={15} /> Buat Soal
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {BANK.map((b, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Pill bg="#e3f0fc" fg="#0d47a1">{b.type}</Pill>
                <Pill
                  bg={b.diff === "Mudah" ? "#dcfce7" : b.diff === "Sedang" ? "#fff3e0" : "#fee2e2"}
                  fg={b.diff === "Mudah" ? "#15803d" : b.diff === "Sedang" ? "#b45309" : "#b91c1c"}
                >
                  {b.diff}
                </Pill>
              </div>
              <Icon name="more" size={18} className="text-subtle" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">{b.q}</p>
            <p className="mt-1 text-[11px] text-muted">Kunci: {b.a}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
