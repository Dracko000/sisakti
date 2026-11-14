"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { Mascot } from "@/components/Mascot";
import { Icon } from "@/components/Icon";
import { ROLE_LABEL } from "@/lib/nav";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/cn";

const ROLES: Role[] = ["student", "teacher", "parent", "admin", "superadmin"];

export default function LoginPage() {
  const { login, loginWithUser } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [tenants, setTenants] = useState<{ id: string; name: string; npsn: string }[]>([]);
  const [tenantId, setTenantId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (role !== "admin") return;
    fetch("/api/tenants").then((r) => r.json()).then((d) => {
      const list = d.tenants ?? [];
      setTenants(list);
      if (!tenantId && list[0]) setTenantId(list[0].id);
    }).catch(() => {});
    // eslint-disable-next-line
  }, [role]);

  async function submit() {
    setBusy(true);
    try {
      // Admin Sekolah: bila email+password diisi -> login kredensial ke DB
      if (role === "admin" && email && password) {
        const r = await fetch("/api/auth/login", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const d = await r.json();
        if (!r.ok) { alert(d.error ?? "Login gagal"); return; }
        await loginWithUser(d.user);
        router.push("/admin");
        return;
      }
      await login(role, role === "admin" ? (tenantId || undefined) : undefined);
      router.push(`/${role}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-primary-dark p-14 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full bg-primary/50" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[560px] w-[560px] rounded-full bg-primary/30" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
            <Icon name="bookOpen" size={26} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold leading-none">SiSAKTI</p>
            <p className="mt-1 text-xs font-medium text-primary-100">
              Sistem Administrasi Kelas & Aktivitas Terintegrasi SIBI
            </p>
          </div>
        </div>

        <div className="relative mt-24 max-w-lg">
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight">
            Belajar dari buku, tumbuh bersama kelas.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-primary-100">
            Materi perbukuan resmi SIBI Kemendikbudristek terintegrasi dengan kelas live,
            papan interaktif paperless, kuis, dan manajemen kelas terpadu.
          </p>
          <div className="mt-10 space-y-3">
            {[
              ["libraryBig", "Katalog SIBI terkurasi"],
              ["video", "Kelas live interaktif"],
              ["penLine", "Papan interaktif paperless per mapel"],
            ].map(([ic, txt]) => (
              <div key={txt} className="flex w-fit items-center gap-3 rounded-2xl bg-white/10 px-5 py-3">
                <Icon name={ic} size={20} className="text-accent" />
                <span className="text-sm font-semibold">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-auto flex items-end justify-between">
          <div>
            <p className="font-display text-3xl font-bold">12.480+</p>
            <p className="text-xs font-medium text-primary-100">buku digital SIBI</p>
            <span className="mt-2 block h-1 w-10 rounded bg-accent" />
          </div>
          <Mascot size={160} />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-[460px]">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Selamat datang kembali</h2>
          <p className="mt-2 text-sm text-muted">Masuk untuk melanjutkan petualangan belajarmu.</p>

          <p className="mb-2 mt-8 text-xs font-semibold text-text">Masuk sebagai</p>
          <div className="grid grid-cols-5 gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-xl border py-2.5 text-[13px] font-bold transition-colors",
                  role === r
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-sl-50 text-muted hover:border-primary-200",
                )}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>

          {role === "admin" && (
            <p className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-[11px] text-primary-dark">
              Admin Sekolah login dengan <b>email & kata sandi</b> yang diberikan Admin Platform. (Isi email & kata sandi di bawah.)
            </p>
          )}
          {role === "admin" && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-text">Pilih Sekolah (Tenant)</label>
              {tenants.length > 0 ? (
                <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-sl-50 px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30">
                  {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.npsn}</option>)}
                </select>
              ) : (
                <p className="mt-1.5 rounded-xl bg-accent-50 px-4 py-3 text-[12px] text-amber-700">
                  Belum ada tenant. Masuk sebagai <b>Admin Platform</b> untuk membuat tenant sekolah terlebih dahulu.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-text">Alamat Email</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-sl-50 px-4 py-3">
                <Icon name="globe" size={18} className="text-subtle" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "email admin sekolah" : "email"}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text">Kata Sandi</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-sl-50 px-4 py-3">
                <Icon name="lock" size={18} className="text-subtle" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={role === "admin" ? "kata sandi sementara" : "kata sandi"}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
                />
                <Icon name="eye" size={18} className="text-subtle" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <label className="flex items-center gap-2 font-medium text-text">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-white">
                <Icon name="check" size={13} />
              </span>
              Ingat saya
            </label>
            <button className="font-bold text-primary hover:text-primary-dark">Lupa kata sandi?</button>
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-bold text-white card-shadow transition-colors hover:bg-primary-dark disabled:opacity-70"
          >
            {busy ? "Memuat…" : `Masuk sebagai ${ROLE_LABEL[role]}`}
            <Icon name="arrowRight" size={18} />
          </button>

          <p className="mt-6 text-center text-xs text-subtle">
            © 2025 SiSAKTI · Terintegrasi SIBI Kemendikbudristek · Demo tanpa kata sandi
          </p>
        </div>
      </div>
    </div>
  );
}
