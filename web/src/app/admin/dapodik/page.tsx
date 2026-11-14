"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Pill, Avatar } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

type Tenant = {
  id: string; name: string; npsn: string; level: string; city: string;
  dapodik: { baseUrl: string; npsn: string; hasToken: boolean; timeoutMs: number } | null;
  lastSync: { status: string; syncedAt: string; counts?: { guru: number; siswa: number; rombel: number } } | null;
};
type Row = Record<string, string | number | null>;
type Probe = { baseUrl: string; reachable: boolean; results: { endpoint: string; ok: boolean; status?: number; latencyMs: number; message: string; sample?: string }[] };

function DapodikInner() {
  const sp = useSearchParams();
  const { user } = useSession();
  const tenantId = sp.get("tenantId") || user?.tenantId || "";

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [probe, setProbe] = useState<Probe | null>(null);

  // config form
  const [baseUrl, setBaseUrl] = useState("");
  const [npsn, setNpsn] = useState("");
  const [token, setToken] = useState("");
  const [timeoutMs, setTimeoutMs] = useState(8000);

  // data tabs
  const [tab, setTab] = useState<"siswa" | "guru" | "rombel">("siswa");
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [q, setQ] = useState("");
  const [sekolah, setSekolah] = useState<Row | null>(null);
  const take = 50;

  const loadTenant = useCallback(async () => {
    if (!tenantId) { setNotFound(true); return; }
    const r = await fetch(`/api/tenants/${tenantId}`);
    if (!r.ok) { setNotFound(true); return; }
    const { tenant: t } = await r.json();
    setTenant(t);
    setBaseUrl(t.dapodik?.baseUrl ?? "");
    setNpsn(t.dapodik?.npsn ?? t.npsn ?? "");
    setTimeoutMs(t.dapodik?.timeoutMs ?? 8000);
  }, [tenantId]);

  const loadData = useCallback(async (entity: string, offset: number, query: string) => {
    if (!tenantId) return;
    const params = new URLSearchParams({ entity, take: String(take), skip: String(offset) });
    if (query) params.set("q", query);
    const r = await fetch(`/api/tenants/${tenantId}/data?${params}`);
    if (!r.ok) return;
    const d = await r.json();
    if (entity === "sekolah") setSekolah(d.sekolah);
    else { setRows(d.rows ?? []); setTotal(d.total ?? 0); }
  }, [tenantId]);

  useEffect(() => { loadTenant(); }, [loadTenant]);
  useEffect(() => { loadData("sekolah", 0, ""); }, [loadData]);
  useEffect(() => { setSkip(0); loadData(tab, 0, q); /* eslint-disable-next-line */ }, [tab, tenant?.lastSync?.syncedAt]);

  async function saveConn() {
    if (!tenant) return;
    setSaving(true); setMsg(null);
    try {
      const r = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ dapodik: { baseUrl, npsn, token, timeoutMs } }),
      });
      const d = await r.json();
      if (!r.ok) { setMsg({ ok: false, text: d.error ?? "Gagal menyimpan" }); return; }
      setToken("");
      setMsg({ ok: true, text: "Konfigurasi tersimpan." });
      await loadTenant();
    } finally { setSaving(false); }
  }

  async function testConn() {
    if (!tenant) return;
    setProbe(null); setMsg(null);
    const r = await fetch(`/api/dapodik/test?tenantId=${tenant.id}`, { method: "POST" });
    const d = await r.json();
    if (!r.ok) { setMsg({ ok: false, text: d.error ?? "Gagal uji koneksi" }); return; }
    setProbe(d);
  }

  async function runSync() {
    if (!tenant) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/api/dapodik/sync?tenantId=${tenant.id}`, { method: "POST" });
      const d = await r.json();
      setMsg({ ok: d.status === "success", text: d.message });
      await loadTenant();
      await loadData("sekolah", 0, "");
      setSkip(0); await loadData(tab, 0, q);
    } finally { setBusy(false); }
  }

  if (notFound) {
    return (
      <AppShell role="admin" title="Integrasi Dapodik" subtitle="Pilih tenant terlebih dahulu">
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <Icon name="server" size={40} className="text-subtle" />
          <p className="font-display text-sm font-bold text-ink">Tenant tidak dipilih / tidak ditemukan</p>
          <Link href="/superadmin" className="mt-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white">Ke Daftar Tenant</Link>
        </Card>
      </AppShell>
    );
  }

  const counts = tenant?.lastSync?.counts;

  return (
    <AppShell role="admin" title="Integrasi Dapodik" subtitle={tenant ? `${tenant.name} · NPSN ${tenant.npsn}` : "Memuat…"}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><Icon name="server" size={20} className="text-primary" /></div>
              <div>
                <p className="font-display text-sm font-bold text-ink">Koneksi Dapodik Tenant</p>
                <p className="text-[11px] text-muted">Web Service Dapodik lokal sekolah</p>
              </div>
            </div>
            {tenant?.dapodik ? <Pill bg="#dcfce7" fg="#15803d" dot="#22c55e">Terhubung</Pill> : <Pill bg="#fff3e0" fg="#b45309" dot="#ff9800">Belum dikonfigurasi</Pill>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Base URL Web Service" value={baseUrl} onChange={setBaseUrl} placeholder="http://192.168.1.10:5774" mono />
            <Field label="NPSN" value={npsn} onChange={setNpsn} placeholder="20236167" />
            <Field label={tenant?.dapodik?.hasToken ? "Token (kosongkan = pertahankan)" : "Token Web Service"} value={token} onChange={setToken} placeholder="token dari Dapodik" type="password" />
            <Field label="Timeout (ms)" value={String(timeoutMs)} onChange={(v) => setTimeoutMs(Number(v.replace(/\D/g, "")) || 8000)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={saveConn} disabled={saving} className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-bold text-text hover:bg-sl-50 disabled:opacity-60">
              <Icon name="check" size={15} /> {saving ? "Menyimpan…" : "Simpan"}
            </button>
            <button onClick={testConn} disabled={!tenant?.dapodik} className="flex items-center gap-1.5 rounded-lg bg-sl-50 px-4 py-2.5 text-xs font-bold text-text hover:bg-sl-100 disabled:opacity-50">
              <Icon name="activity" size={15} /> Uji Koneksi
            </button>
            <button onClick={runSync} disabled={busy || !tenant?.dapodik} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
              <Icon name="refresh" size={15} className={busy ? "animate-spin" : ""} /> {busy ? "Menyinkronkan…" : "Sinkronkan"}
            </button>
          </div>

          {msg && (
            <div className={cn("mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold", msg.ok ? "bg-ok-50 text-ok-dark" : "bg-danger-50 text-danger")}>
              <Icon name={msg.ok ? "checkCircle" : "circleAlert"} size={15} /> {msg.text}
            </div>
          )}

          <p className="mt-3 rounded-lg bg-sl-50 px-3 py-2 text-[11px] leading-relaxed text-muted">
            Token dikirim sebagai <span className="font-mono font-semibold text-text">Authorization: Bearer</span> + parameter
            <span className="font-mono font-semibold text-text"> npsn</span>. Token hanya tersimpan di server, tidak dikirim ke browser.
          </p>
        </Card>

        {probe ? (
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Icon name="activity" size={16} className="text-primary" />
              <p className="font-display text-sm font-bold text-ink">Diagnostik</p>
              <Pill bg={probe.reachable ? "#dcfce7" : "#fee2e2"} fg={probe.reachable ? "#15803d" : "#b91c1c"} className="ml-auto">{probe.reachable ? "Terjangkau" : "Gagal"}</Pill>
            </div>
            <div className="mt-2 space-y-1.5">
              {probe.results.map((r) => (
                <div key={r.endpoint} className="rounded-lg bg-sl-50 px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon name={r.ok ? "checkCircle" : "circleAlert"} size={13} className={r.ok ? "text-ok-dark" : "text-danger"} />
                    <span className="font-mono text-[10px] font-bold text-ink">{r.endpoint}</span>
                    <span className="ml-auto text-[9px] text-subtle">{r.latencyMs}ms</span>
                  </div>
                  <p className={cn("mt-0.5 text-[10px] leading-snug", r.ok ? "text-ok-dark" : "text-danger")}>{r.message}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-5">
            <p className="font-display text-sm font-bold text-ink">Cara Kerja</p>
            <div className="mt-3 space-y-3">
              {[["Dapodik sekolah (lokal)", "Web Service JSON di LAN sekolah (port 5774)."], ["Token + NPSN", "Dikirim sebagai Bearer + parameter npsn."], ["SiSAKTI pusat", "Data disimpan per tenant di database."]].map(([t, d], i) => (
                <div key={t} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary-dark">{i + 1}</div>
                  <div><p className="text-[12px] font-bold text-ink">{t}</p><p className="text-[11px] text-muted">{d}</p></div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* data */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50"><Icon name="school" size={20} className="text-primary" /></div><div className="min-w-0"><p className="text-xs text-muted">Sekolah</p><p className="truncate font-display text-sm font-bold text-ink">{String(sekolah?.nama ?? "—")}</p></div></Card>
        <Card className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50"><Icon name="graduationCap" size={20} className="text-teal" /></div><div><p className="text-xs text-muted">Guru / PTK</p><p className="font-display text-xl font-bold text-ink">{counts?.guru ?? 0}</p></div></Card>
        <Card className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50"><Icon name="usersRound" size={20} className="text-amber-700" /></div><div><p className="text-xs text-muted">Peserta Didik</p><p className="font-display text-xl font-bold text-ink">{counts?.siswa ?? 0}</p></div></Card>
        <Card className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50"><Icon name="layers" size={20} className="text-purple" /></div><div><p className="text-xs text-muted">Rombel</p><p className="font-display text-xl font-bold text-ink">{counts?.rombel ?? 0}</p></div></Card>
      </div>

      {sekolah && (
        <Card className="mt-4 p-5">
          <div className="flex items-center gap-2">
            <Icon name="school" size={16} className="text-primary" />
            <p className="font-display text-sm font-bold text-ink">Data Sekolah</p>
            <Pill bg="#dcfce7" fg="#15803d" className="ml-auto">NPSN {String(sekolah.npsn ?? "")}</Pill>
          </div>
          <div className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {[["Nama", "nama"], ["Bentuk", "bentuk"], ["Alamat", "alamat"], ["Kecamatan", "kecamatan"], ["Kab/Kota", "kabupaten"], ["Provinsi", "provinsi"]].map(([label, key]) => (
              <div key={key} className="flex gap-2"><span className="w-20 shrink-0 text-muted">{label}</span><span className="font-semibold text-text">{String(sekolah[key] ?? "—")}</span></div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line-2 px-4 py-3">
          {(["siswa", "guru", "rombel"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-lg px-3 py-1.5 text-[12px] font-bold capitalize", tab === t ? "bg-primary text-white" : "bg-sl-50 text-muted")}>{t}</button>
          ))}
          <div className="relative ml-auto">
            <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSkip(0); loadData(tab, 0, q); } }}
              placeholder="Cari nama…"
              className="w-48 rounded-lg border border-line bg-white py-1.5 pl-8 pr-3 text-[12px] outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-5 py-14 text-center">
              <Icon name="database" size={30} className="text-subtle" />
              <p className="text-xs text-muted">Belum ada data {tab}. Klik <b>Sinkronkan</b>.</p>
            </div>
          ) : tab === "siswa" ? (
            <table className="w-full min-w-[620px] text-sm">
              <thead><tr className="bg-sl-50 text-left text-xs font-bold text-muted"><th className="px-4 py-3">Nama</th><th className="px-4 py-3">NISN</th><th className="px-4 py-3">JK</th><th className="px-4 py-3">Rombel</th><th className="px-4 py-3">Tingkat</th></tr></thead>
              <tbody>{rows.map((s, i) => (
                <tr key={i} className="border-t border-line-2 hover:bg-sl-50">
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar initials={String(s.nama ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")} color="#1e88e5" size={28} /><span className="font-semibold text-ink">{String(s.nama ?? "")}</span></div></td>
                  <td className="px-4 py-2.5 text-xs text-muted">{String(s.nisn || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(s.jk || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(s.rombel || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(s.tingkat || "—")}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : tab === "guru" ? (
            <table className="w-full min-w-[620px] text-sm">
              <thead><tr className="bg-sl-50 text-left text-xs font-bold text-muted"><th className="px-4 py-3">Nama</th><th className="px-4 py-3">NUPTK</th><th className="px-4 py-3">JK</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>{rows.map((g, i) => (
                <tr key={i} className="border-t border-line-2 hover:bg-sl-50">
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar initials={String(g.nama ?? "?").split(" ").map((x) => x[0]).slice(0, 2).join("")} color="#ff9800" size={28} /><span className="font-semibold text-ink">{String(g.nama ?? "")}</span></div></td>
                  <td className="px-4 py-2.5 text-xs text-muted">{String(g.nuptk || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(g.jk || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(g.statusKepegawaian || "—")}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="bg-sl-50 text-left text-xs font-bold text-muted"><th className="px-4 py-3">Rombel</th><th className="px-4 py-3">Tingkat</th><th className="px-4 py-3">Wali Kelas</th><th className="px-4 py-3">Jumlah Siswa</th></tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={i} className="border-t border-line-2 hover:bg-sl-50">
                  <td className="px-4 py-2.5 font-semibold text-ink">{String(r.nama ?? "")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(r.tingkat || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(r.waliKelas || "—")}</td>
                  <td className="px-4 py-2.5 text-xs">{String(r.jumlahSiswa ?? "—")}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        {total > take && (
          <div className="flex items-center justify-between border-t border-line-2 px-4 py-2.5 text-[11px] text-muted">
            <span>Menampilkan {skip + 1}–{Math.min(skip + take, total)} dari {total}</span>
            <div className="flex gap-1.5">
              <button disabled={skip === 0} onClick={() => { const n = Math.max(0, skip - take); setSkip(n); loadData(tab, n, q); }} className="rounded-md bg-sl-50 px-2.5 py-1 font-bold disabled:opacity-40">Sebelumnya</button>
              <button disabled={skip + take >= total} onClick={() => { const n = skip + take; setSkip(n); loadData(tab, n, q); }} className="rounded-md bg-sl-50 px-2.5 py-1 font-bold disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  );
}

export default function DapodikPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted">Memuat…</div>}>
      <DapodikInner />
    </Suspense>
  );
}

function Field({ label, value, onChange, placeholder, mono, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; type?: string }) {
  return (
    <label className="block rounded-xl bg-sl-50 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wide text-subtle">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type ?? "text"}
        className={cn("mt-0.5 w-full bg-transparent text-[12px] font-semibold text-text outline-none placeholder:font-normal placeholder:text-subtle", mono && "font-mono")}
      />
    </label>
  );
}
