"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useSession } from "@/lib/session";

type Tenant = {
  id: string; name: string; npsn: string; level: string; city: string; plan: string; status: string;
  dapodik: { baseUrl: string; hasToken: boolean } | null;
  lastSync: { status: string; syncedAt: string; counts?: { guru: number; siswa: number; rombel: number } } | null;
};

export default function SchoolAdminDashboard() {
  const { user } = useSession();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const tenantId = user?.tenantId;

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenants/${tenantId}`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setTenant(d.tenant)).catch(() => {});
  }, [tenantId]);

  return (
    <AppShell role="admin" title="Dashboard Sekolah" subtitle={tenant ? `${tenant.name} · NPSN ${tenant.npsn}` : "Admin Sekolah"}>
      {!tenantId ? (
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <Icon name="school" size={40} className="text-subtle" />
          <p className="font-display text-sm font-bold text-ink">Akun belum terhubung ke sekolah</p>
          <p className="text-xs text-muted">Hubungi Admin Platform untuk menautkan akun Anda ke tenant sekolah.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* tenant card */}
          <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-white">
            <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-primary-dark/40" />
            <div className="relative flex flex-wrap items-center gap-4">
              <Avatar initials={tenant?.name?.split(" ").map((x) => x[0]).slice(0, 2).join("") || "SK"} color="#ffffff" size={60} className="!text-primary" />
              <div>
                <p className="font-display text-2xl font-bold">{tenant?.name ?? "Memuat…"}</p>
                <p className="text-sm text-primary-100">{tenant?.level} · {tenant?.city} · NPSN {tenant?.npsn}</p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                <Pill bg="#ffffff" fg="#0d47a1">{tenant?.plan ?? "—"}</Pill>
                <Pill bg="#ff9800" fg="#fff">{tenant?.status ?? "—"}</Pill>
              </div>
            </div>
          </div>

          {/* stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Guru / PTK", tenant?.lastSync?.counts?.guru ?? "—", "graduationCap", "#e3f0fc", "#1e88e5"],
              ["Siswa", tenant?.lastSync?.counts?.siswa ?? "—", "usersRound", "#fff3e0", "#b45309"],
              ["Rombel", tenant?.lastSync?.counts?.rombel ?? "—", "layers", "#ccfbf1", "#0f766e"],
              ["Status Dapodik", tenant?.dapodik ? "Terhubung" : "Belum", "server", "#ede9fe", "#8b5cf6"],
            ].map(([label, val, ic, tint, color]) => (
              <Card key={label as string} className="flex items-center gap-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: tint as string }}>
                  <Icon name={ic as string} size={22} style={{ color: color as string }} />
                </div>
                <div><p className="text-xs font-semibold text-muted">{label}</p><p className="font-display text-xl font-bold text-ink">{val}</p></div>
              </Card>
            ))}
          </div>

          {/* quick links */}
          <div className="grid gap-4 md:grid-cols-3">
            <QuickLink href="/admin/dapodik" icon="server" title="Integrasi Dapodik" desc="Tarik data guru, siswa & rombel sekolah ini." />
            <QuickLink href="/admin/users" icon="usersRound" title="Pengguna" desc="Kelola akun guru, siswa & orang tua." />
            <QuickLink href="/admin/classes" icon="school" title="Kelas & Rombel" desc="Atur rombongan belajar." />
          </div>

          {tenant?.lastSync && (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Icon name={tenant.lastSync.status === "success" ? "checkCircle" : "circleAlert"} size={16} className={tenant.lastSync.status === "success" ? "text-ok-dark" : "text-danger"} />
                <p className="text-sm font-semibold text-text">
                  Sinkronisasi terakhir: {new Date(tenant.lastSync.syncedAt).toLocaleString("id-ID")} — {tenant.lastSync.status}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card className="h-full p-5 transition-colors hover:border-primary-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><Icon name={icon} size={20} className="text-primary" /></div>
        <p className="mt-3 font-display text-sm font-bold text-ink">{title}</p>
        <p className="mt-1 text-[11px] text-muted">{desc}</p>
      </Card>
    </Link>
  );
}
