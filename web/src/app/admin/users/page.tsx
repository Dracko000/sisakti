import { AppShell } from "@/components/AppShell";
import { Card, EmptyState, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function AdminUsers() {
  return (
    <AppShell role="admin" title="Manajemen Pengguna" subtitle="Akun Siswa, Guru & Orang Tua per tenant">
      <div className="mb-4 flex justify-end">
        <button className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white"><Icon name="userPlus" size={15} /> Tambah Pengguna</button>
      </div>
      <Card className="p-2">
        <EmptyState
          title="Belum ada pengguna"
          sub="Akun pengguna dibuat dari sinkronisasi Dapodik atau impor pada masing-masing tenant. Pilih tenant lalu sinkronkan data."
        />
      </Card>
    </AppShell>
  );
}
