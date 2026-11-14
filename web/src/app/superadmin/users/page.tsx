import { AppShell } from "@/components/AppShell";
import { Card, EmptyState } from "@/components/ui";

export default function SuperadminUsers() {
  return (
    <AppShell role="superadmin" title="Semua Pengguna" subtitle="Pengguna lintas seluruh tenant">
      <Card className="p-2">
        <EmptyState
          title="Belum ada pengguna platform"
          sub="Daftar pengguna lintas tenant akan tampil di sini. Akun admin sekolah dibuat per tenant."
        />
      </Card>
    </AppShell>
  );
}
