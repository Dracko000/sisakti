"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/cn";

type Tenant = {
  id: string;
  name: string;
  npsn: string;
  level: string;
  city: string;
  plan: string;
  status: "Trial" | "Active" | "Suspended";
  createdAt: string;
  dapodik: { baseUrl: string; npsn: string; hasToken: boolean } | null;
  lastSync: { status: string; syncedAt: string; counts?: { siswa: number } } | null;
};

const LEVELS = ["SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"];
const PLANS = ["Trial", "Free", "Pro", "Enterprise"];

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; trial: number; suspended: number; connected: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", npsn: "", level: "SMP/MTs", city: "", plan: "Trial", adminName: "", adminEmail: "" });
  const [creds, setCreds] = useState<{ email: string; tempPassword: string; tenant: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/tenants");
    const d = await r.json();
    setTenants(d.tenants);
    setStats(d.stats);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.name.trim() || !form.npsn.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/tenants", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { alert(d.error ?? "Gagal membuat tenant"); return; }
      setCreds({ email: d.admin.email, tempPassword: d.admin.tempPassword, tenant: d.tenant.name });
      setForm({ name: "", npsn: "", level: "SMP/MTs", city: "", plan: "Trial", adminName: "", adminEmail: "" });
      setShowForm(false);
      await load();
    } finally { setBusy(false); }
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/tenants/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }
  async function provisionAdmin(t: Tenant) {
    const r = await fetch(`/api/tenants/${t.id}/admin`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
    const d = await r.json();
    if (!r.ok) { alert(d.error ?? "Gagal membuat akun admin"); return; }
    setCreds({ email: d.email, tempPassword: d.tempPassword, tenant: t.name });
  }
  async function remove(id: string) {
    if (!confirm("Hapus tenant ini?")) return;
    await fetch(`/api/tenants/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <AppShell role="superadmin" title="Tenant & Platform" subtitle="Admin platform — kelola seluruh tenant (sekolah)">
      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Tenant", stats?.total ?? 0, "school", "#e3f0fc", "#1e88e5"],
          ["Aktif", stats?.active ?? 0, "checkCircle", "#dcfce7", "#15803d"],
          ["Trial", stats?.trial ?? 0, "sparkles", "#fff3e0", "#b45309"],
          ["Terhubung Dapodik", stats?.connected ?? 0, "server", "#ede9fe", "#8b5cf6"],
        ].map(([label, val, ic, tint, color]) => (
          <Card key={label as string} className="flex items-center gap-3 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: tint as string }}>
              <Icon name={ic as string} size={22} style={{ color: color as string }} />
            </div>
            <div><p className="text-xs font-semibold text-muted">{label}</p><p className="font-display text-2xl font-bold text-ink">{val}</p></div>
          </Card>
        ))}
      </div>

      {creds && (
        <Card className="mt-4 border-2 border-ok/40 bg-ok-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display text-sm font-bold text-ok-dark"><Icon name="badgeCheck" size={18} /> Akun Admin Sekolah dibuat otomatis</p>
              <p className="mt-1 text-[12px] text-text">Tenant <b>{creds.tenant}</b>. Bagikan kredensial ini ke admin sekolah (hanya tampil sekali):</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white px-3 py-2"><p className="text-[10px] font-bold uppercase text-subtle">Email</p><p className="font-mono text-[13px] font-semibold text-ink">{creds.email}</p></div>
                <div className="rounded-lg bg-white px-3 py-2"><p className="text-[10px] font-bold uppercase text-subtle">Kata Sandi Sementara</p><p className="font-mono text-[13px] font-semibold text-ink">{creds.tempPassword}</p></div>
              </div>
            </div>
            <button onClick={() => setCreds(null)} className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-muted">Tutup</button>
          </div>
        </Card>
      )}

      {/* toolbar */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Daftar Tenant</h2>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white">
          <Icon name="plus" size={15} /> Tenant Baru
        </button>
      </div>

      {/* create form */}
      {showForm && (
        <Card className="mt-3 p-5">
          <p className="font-display text-sm font-bold text-ink">Tambah Tenant (Sekolah)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input label="Nama Sekolah" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="SMP Negeri 1 …" />
            <Input label="NPSN" value={form.npsn} onChange={(v) => setForm({ ...form, npsn: v })} placeholder="20219801" />
            <Select label="Jenjang" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={LEVELS} />
            <Input label="Kota/Kab" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Bandung" />
            <Select label="Paket" value={form.plan} onChange={(v) => setForm({ ...form, plan: v })} options={PLANS} />
            <Input label="Nama Admin Sekolah" value={form.adminName} onChange={(v) => setForm({ ...form, adminName: v })} placeholder="(opsional)" />
            <Input label="Email Admin" value={form.adminEmail} onChange={(v) => setForm({ ...form, adminEmail: v })} placeholder="(default: admin@NPSN.sisakti.id)" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={create} disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan Tenant"}</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg bg-sl-50 px-4 py-2 text-xs font-bold text-muted">Batal</button>
          </div>
        </Card>
      )}

      {/* tenant list */}
      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="bg-sl-50 text-left text-xs font-bold text-muted">
                <th className="px-5 py-3">Sekolah</th>
                <th className="px-4 py-3">NPSN</th>
                <th className="px-4 py-3">Jenjang</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dapodik</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center">
                  <Icon name="school" size={34} className="mx-auto text-subtle" />
                  <p className="mt-2 font-display text-sm font-bold text-ink">Belum ada tenant</p>
                  <p className="text-xs text-muted">Tambahkan sekolah pertama untuk mulai. Data tenant tersimpan di server.</p>
                </td></tr>
              )}
              {tenants.map((t) => (
                <tr key={t.id} className="border-t border-line-2 hover:bg-sl-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={t.name.split(" ").map((x) => x[0]).slice(0, 2).join("")} color="#1e88e5" size={34} />
                      <div>
                        <p className="font-semibold text-ink">{t.name}</p>
                        <p className="text-[11px] text-muted">{t.city || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text">{t.npsn}</td>
                  <td className="px-4 py-3 text-xs text-text">{t.level}</td>
                  <td className="px-4 py-3"><Pill bg="#e3f0fc" fg="#0d47a1">{t.plan}</Pill></td>
                  <td className="px-4 py-3">
                    <Pill bg={t.status === "Active" ? "#dcfce7" : t.status === "Trial" ? "#fff3e0" : "#fee2e2"} fg={t.status === "Active" ? "#15803d" : t.status === "Trial" ? "#b45309" : "#b91c1c"} dot={t.status === "Active" ? "#22c55e" : t.status === "Trial" ? "#ff9800" : "#ef4444"}>
                      {t.status}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    {t.dapodik ? (
                      <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">Terhubung</Pill>
                    ) : (
                      <Pill bg="#f1f5f9" fg="#64748b">Belum</Pill>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => provisionAdmin(t)} className="rounded-lg bg-primary-50 px-2.5 py-1.5 text-[11px] font-bold text-primary-dark hover:bg-primary-100" title="Buat / reset akun admin sekolah">
                        <Icon name="keyRound" size={13} />
                      </button>
                      <Link href={`/admin/dapodik?tenantId=${t.id}`} className="rounded-lg bg-sl-50 px-2.5 py-1.5 text-[11px] font-bold text-primary-dark hover:bg-sl-100" title="Kelola Dapodik">
                        <Icon name="server" size={13} />
                      </Link>
                      {t.status !== "Active" ? (
                        <button onClick={() => setStatus(t.id, "Active")} className="rounded-lg bg-ok-50 px-2.5 py-1.5 text-[11px] font-bold text-ok-dark hover:bg-ok-100" title="Aktifkan">Aktifkan</button>
                      ) : (
                        <button onClick={() => setStatus(t.id, "Suspended")} className="rounded-lg bg-accent-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-accent-100" title="Suspend">Suspend</button>
                      )}
                      <button onClick={() => remove(t.id)} className="rounded-lg bg-danger-50 px-2.5 py-1.5 text-[11px] font-bold text-danger-dark hover:bg-danger-100" title="Hapus">
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/30">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
