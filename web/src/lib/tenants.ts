import { prisma } from "./prisma";
import { hashPassword, generateTempPassword } from "./password";
import type { DapodikSyncResult } from "./dapodik";

// ---------------------------------------------------------------- Tenant (DB-backed)
export type TenantPlan = "Trial" | "Free" | "Pro" | "Enterprise";
export type TenantStatus = "Trial" | "Active" | "Suspended";

export interface TenantDapodikConn {
  baseUrl: string;
  npsn: string;
  token?: string;
  timeoutMs: number;
}

export interface TenantView {
  id: string;
  name: string;
  npsn: string;
  level: string;
  city: string;
  plan: string;
  status: string;
  createdAt: string;
  dapodik: { baseUrl: string; npsn: string; hasToken: boolean; timeoutMs: number } | null;
  lastSync: { status: string; syncedAt: string; counts?: { sekolah: number; guru: number; siswa: number; rombel: number } } | null;
}

export async function listTenants() {
  const rows = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { dapodik: true },
  });
  return rows.map(toView);
}

export async function getTenant(id: string) {
  const t = await prisma.tenant.findUnique({ where: { id }, include: { dapodik: true } });
  return t ? toView(t) : null;
}
export async function getTenantRaw(id: string) {
  return prisma.tenant.findUnique({ where: { id }, include: { dapodik: true } });
}

export async function createTenant(input: {
  name: string;
  npsn: string;
  level: string;
  city: string;
  plan?: TenantPlan;
  adminName?: string;
  adminEmail?: string;
}): Promise<{ tenant: TenantView; admin: { email: string; tempPassword: string } }> {
  const email = (input.adminEmail?.trim() || `admin@${input.npsn.trim()}.sisakti.id`).toLowerCase();
  const tempPassword = generateTempPassword();

  const t = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.name.trim(),
        npsn: input.npsn.trim(),
        level: input.level,
        city: input.city?.trim() ?? "",
        plan: input.plan ?? "Trial",
        status: "Trial",
      },
    });
    // Akun Admin Sekolah otomatis (role "admin") terikat ke tenant
    await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: input.adminName?.trim() || `Admin ${input.name.trim()}`,
        email,
        passwordHash: hashPassword(tempPassword),
        role: "admin",
        initials: initials(input.adminName || input.name),
        avatarColor: "#0d47a1",
        detail: "Admin Sekolah",
      },
    });
    return tenant;
  });

  return {
    tenant: toView(await prisma.tenant.findUnique({ where: { id: t.id }, include: { dapodik: true } }) as never),
    admin: { email, tempPassword },
  };
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase() || "AS";
}

export async function updateTenant(id: string, patch: { name?: string; npsn?: string; level?: string; city?: string; plan?: string; status?: string }) {
  try {
    const t = await prisma.tenant.update({ where: { id }, data: patch, include: { dapodik: true } });
    return toView(t);
  } catch {
    return null;
  }
}

export async function deleteTenant(id: string) {
  try {
    await prisma.tenant.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- Dapodik conn
export async function setTenantDapodik(id: string, conn: TenantDapodikConn | null) {
  if (!conn) {
    await prisma.tenantDapodik.deleteMany({ where: { tenantId: id } });
    return getTenant(id);
  }
  const prev = await prisma.tenantDapodik.findUnique({ where: { tenantId: id } });
  await prisma.tenantDapodik.upsert({
    where: { tenantId: id },
    create: { tenantId: id, baseUrl: conn.baseUrl, npsn: conn.npsn, token: conn.token ?? null, timeoutMs: conn.timeoutMs },
    update: { baseUrl: conn.baseUrl, npsn: conn.npsn, token: conn.token ?? prev?.token ?? null, timeoutMs: conn.timeoutMs },
  });
  return getTenant(id);
}

export async function getTenantDapodikConn(id: string): Promise<TenantDapodikConn | null> {
  const d = await prisma.tenantDapodik.findUnique({ where: { tenantId: id } });
  if (!d) return null;
  return { baseUrl: d.baseUrl, npsn: d.npsn, token: d.token ?? undefined, timeoutMs: d.timeoutMs };
}

export async function setTenantLastSync(id: string, result: DapodikSyncResult) {
  await prisma.tenantDapodik.updateMany({
    where: { tenantId: id },
    data: {
      lastSyncStatus: result.status,
      lastSyncAt: new Date(result.syncedAt),
      lastSyncCounts: result.counts ? JSON.stringify(result.counts) : null,
    },
  });
}

// ---------------------------------------------------------------- helpers
type TenantWithConn = Awaited<ReturnType<typeof prisma.tenant.findFirst>> & {
  dapodik?: { baseUrl: string; npsn: string; token: string | null; timeoutMs: number; lastSyncStatus: string | null; lastSyncAt: Date | null; lastSyncCounts: string | null } | null;
};

function toView(t: TenantWithConn): TenantView {
  const d = t.dapodik;
  return {
    id: t.id,
    name: t.name,
    npsn: t.npsn,
    level: t.level,
    city: t.city,
    plan: t.plan,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    dapodik: d ? { baseUrl: d.baseUrl, npsn: d.npsn, hasToken: Boolean(d.token), timeoutMs: d.timeoutMs } : null,
    lastSync:
      d && d.lastSyncStatus
        ? {
            status: d.lastSyncStatus,
            syncedAt: (d.lastSyncAt ?? new Date()).toISOString(),
            counts: d.lastSyncCounts ? JSON.parse(d.lastSyncCounts) : undefined,
          }
        : null,
  };
}

export async function tenantStats() {
  const [total, active, trial, suspended, connected] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "Active" } }),
    prisma.tenant.count({ where: { status: "Trial" } }),
    prisma.tenant.count({ where: { status: "Suspended" } }),
    prisma.tenantDapodik.count(),
  ]);
  return { total, active, trial, suspended, connected };
}

export function publicTenant(t: TenantView) {
  return t; // sudah aman: token tidak disertakan (hanya hasToken)
}

/** Buat atau reset akun Admin Sekolah untuk tenant yang sudah ada. */
export async function provisionTenantAdmin(
  tenantId: string,
  opts?: { name?: string; email?: string },
): Promise<{ email: string; tempPassword: string; created: boolean } | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!t) return null;
  const email = (opts?.email?.trim() || `admin@${t.npsn}.sisakti.id`).toLowerCase();
  const tempPassword = generateTempPassword();
  const existing = await prisma.user.findFirst({ where: { tenantId, role: "admin" } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, passwordHash: hashPassword(tempPassword) },
    });
    return { email, tempPassword, created: false };
  }
  await prisma.user.create({
    data: {
      tenantId,
      name: opts?.name?.trim() || `Admin ${t.name}`,
      email,
      passwordHash: hashPassword(tempPassword),
      role: "admin",
      initials: initials(opts?.name || t.name),
      avatarColor: "#0d47a1",
      detail: "Admin Sekolah",
    },
  });
  return { email, tempPassword, created: true };
}

/** Daftar akun admin sekolah untuk sebuah tenant (tanpa hash). */
export async function listTenantAdmins(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId, role: "admin" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}
