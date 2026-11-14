import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function AdminClasses() {
  return (
    <AppShell role="admin" title="Kelas & Rombel" subtitle="Kelola ruang kelas dan rombongan belajar">
      <Card className="p-2">
        <EmptyState
          title="Belum ada kelas & rombel"
          sub="Rombongan belajar akan tampil setelah data ditarik dari Dapodik tenant atau dibuat manual."
        />
      </Card>
    </AppShell>
  );
}
