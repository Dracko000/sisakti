import { NextResponse, connection } from "next/server";
import { getTenant, provisionTenantAdmin, listTenantAdmins } from "@/lib/tenants";

// GET /api/tenants/:id/admin -> daftar admin sekolah
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ admins: await listTenantAdmins(id) });
}

// POST /api/tenants/:id/admin { name?, email? } -> buat / reset akun admin (kredensial sekali)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const t = await getTenant(id);
  if (!t) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  try {
    const res = await provisionTenantAdmin(id, { name: b?.name, email: b?.email });
    if (!res) return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    return NextResponse.json(res, { status: res.created ? 201 : 200 });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) return NextResponse.json({ error: "Email admin sudah dipakai." }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
