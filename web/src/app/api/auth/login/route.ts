import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { Role, User } from "@/lib/types";

// POST /api/auth/login
//  A) Kredensial: { email, password }  -> verifikasi ke DB (akun Admin Sekolah)
//  B) Peran (dev/provisioning): { role, tenantId? }
export async function POST(req: Request) {
  await connection();
  const b = await req.json().catch(() => ({}));

  // A) Login kredensial
  if (b?.email && b?.password) {
    const email = String(b.email).trim().toLowerCase();
    const candidates = await prisma.user.findMany({ where: { email } });
    for (const u of candidates) {
      if (!verifyPassword(String(b.password), u.passwordHash)) continue;
      if (b.tenantId && u.tenantId && u.tenantId !== b.tenantId) continue;
      return NextResponse.json({ user: toUser(u), token: `session.${u.role}.${Date.now()}` });
    }
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  // B) Login peran (generik) — admin sekolah WAJIB kredensial
  const role: Role = b?.role ?? "student";
  if (role === "admin") {
    return NextResponse.json({ error: "Admin Sekolah wajib login dengan email & kata sandi." }, { status: 401 });
  }
  const valid: Role[] = ["student", "teacher", "parent", "admin", "superadmin"];
  if (!valid.includes(role)) return NextResponse.json({ error: "Role tidak dikenal" }, { status: 400 });
  const generic: Record<string, User> = {
    student: { id: "role-student", name: "Siswa", email: "", role: "student", initials: "SW", avatarColor: "#1e88e5", detail: "Siswa" },
    teacher: { id: "role-teacher", name: "Guru", email: "", role: "teacher", initials: "GR", avatarColor: "#ff9800", detail: "Guru" },
    parent: { id: "role-parent", name: "Orang Tua", email: "", role: "parent", initials: "OT", avatarColor: "#14b8a6", detail: "Orang Tua" },
    admin: { id: "role-admin", name: "Admin Sekolah", email: "", role: "admin", initials: "AS", avatarColor: "#0d47a1", detail: "Admin Tenant" },
    superadmin: { id: "role-superadmin", name: "Admin Platform", email: "", role: "superadmin", initials: "AP", avatarColor: "#082f63", detail: "Admin Platform" },
  };
  const user = { ...generic[role] };
  if (role !== "superadmin" && b?.tenantId) user.tenantId = b.tenantId;
  return NextResponse.json({ user, token: `session.${role}.${Date.now()}` });
}

function toUser(u: { id: string; name: string; email: string; role: string; initials: string; avatarColor: string; detail: string; tenantId: string | null }): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    initials: u.initials,
    avatarColor: u.avatarColor,
    detail: u.detail,
    tenantId: u.tenantId ?? undefined,
  };
}
