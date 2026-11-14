import { NextResponse, connection } from "next/server";
import { createTenant, listTenants, tenantStats } from "@/lib/tenants";

export async function GET() {
  await connection();
  return NextResponse.json({ tenants: await listTenants(), stats: await tenantStats() });
}

// POST /api/tenants { name, npsn, level, city, plan, adminName?, adminEmail? }
// -> membuat tenant + akun Admin Sekolah otomatis; kredensial dikembalikan SEKALI.
export async function POST(req: Request) {
  await connection();
  const b = await req.json().catch(() => ({}));
  if (!b?.name || !b?.npsn) return NextResponse.json({ error: "Nama dan NPSN wajib diisi." }, { status: 400 });
  try {
    const { tenant, admin } = await createTenant({
      name: b.name,
      npsn: b.npsn,
      level: b.level ?? "SMP/MTs",
      city: b.city ?? "",
      plan: b.plan ?? "Trial",
      adminName: b.adminName,
      adminEmail: b.adminEmail,
    });
    return NextResponse.json({ tenant, admin }, { status: 201 });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "NPSN atau email admin sudah dipakai." }, { status: 409 });
    }
    return NextResponse.json({ error: `Gagal membuat tenant: ${msg}` }, { status: 400 });
  }
}
