import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function AdminLogs() {
  return (
    <AppShell role="admin" title="Log Aktivitas" subtitle="Jejak audit seluruh aktivitas sistem">
      <Card className="p-2">
        <EmptyState title="Belum ada log" sub="Aktivitas sinkronisasi Dapodik, login, dan perubahan data akan tercatat di sini." />
      </Card>
    </AppShell>
  );
}
