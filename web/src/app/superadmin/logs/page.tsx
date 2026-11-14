import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function SuperadminLogs() {
  return (
    <AppShell role="superadmin" title="Audit Log Platform" subtitle="Jejak aktivitas lintas tenant">
      <Card className="p-2">
        <EmptyState title="Belum ada log" sub="Aktivitas pembuatan tenant, sinkronisasi Dapodik, dan perubahan platform akan tercatat di sini." />
      </Card>
    </AppShell>
  );
}
